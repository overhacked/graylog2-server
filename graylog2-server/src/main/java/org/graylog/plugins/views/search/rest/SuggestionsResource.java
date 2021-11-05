/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.views.search.rest;

import com.google.common.collect.ImmutableSet;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog.plugins.views.search.engine.QueryEngine;
import org.graylog.plugins.views.search.engine.SuggestRequest;
import org.graylog.plugins.views.search.engine.SuggestionResponse;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.plugin.indexer.searches.timeranges.InvalidRangeParametersException;
import org.graylog2.plugin.indexer.searches.timeranges.RelativeRange;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.graylog2.shared.security.RestPermissions;

import javax.inject.Inject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RequiresAuthentication
@Api(value = "Search/Suggestions")
@Path("/search/suggest")
public class SuggestionsResource extends RestResource implements PluginRestResource {

    private final PermittedStreams permittedStreams;
    private final QueryEngine queryEngine;

    @Inject
    public SuggestionsResource(PermittedStreams permittedStreams, QueryEngine queryEngine) {
        this.permittedStreams = permittedStreams;
        this.queryEngine = queryEngine;
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation("Validate a search query")
    @NoAuditEvent("Only validating query structure, not changing any data")
    public SuggestionsDTO validateQuery(@ApiParam(name = "validationRequest") SuggestionsRequestDTO suggestionsRequest) {

        final SuggestRequest req = SuggestRequest.builder()
                .field(suggestionsRequest.field())
                .input(suggestionsRequest.input())
                .streams(adaptStreams(suggestionsRequest.streams()))
                .timerange(Optional.ofNullable(suggestionsRequest.timerange()).orElse(defaultTimeRange()))
                .build();

        SuggestionResponse res = queryEngine.suggest(req);
        final List<SuggestionEntryDTO> suggestions = res.getSuggestions().stream().map(s -> new SuggestionEntryDTO(s.getValue(), s.getOccurrence())).collect(Collectors.toList());
        return new SuggestionsDTO(res.getField(), res.getInput(), suggestions);
    }

    private Set<String> adaptStreams(Set<String> streams) {
        if (streams == null || streams.isEmpty()) {
            return loadAllAllowedStreamsForUser();
        } else {
            // TODO: is it ok to filter out a stream that's not accessible or should we throw an exception?
            return streams.stream().filter(this::hasStreamReadPermission).collect(Collectors.toSet());
        }
    }

    private RelativeRange defaultTimeRange() {
        try {
            return RelativeRange.create(300);
        } catch (InvalidRangeParametersException e) {
            throw new RuntimeException(e);
        }
    }

    private ImmutableSet<String> loadAllAllowedStreamsForUser() {
        return permittedStreams.load(this::hasStreamReadPermission);
    }

    private boolean hasStreamReadPermission(String streamId) {
        return isPermitted(RestPermissions.STREAMS_READ, streamId);
    }

    protected boolean isPermitted(String permission, String instanceId) {
        return getSubject().isPermitted(permission + ":" + instanceId);
    }
}
