package com.cts.eventsphere.eventmanager.client;

import com.cts.eventsphere.eventmanager.config.ServiceFeignConfig;
import com.cts.eventsphere.eventmanager.dto.venue.VenueDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

/**
 * Feign client for fetching venue details from the venue-manager service.
 *
 * <p>Calls {@code POST /api/v1/venues/bulk}, which is restricted to the
 * {@code SYS_EVENT_MGR} service role. The service token is attached
 * automatically by {@link ServiceFeignConfig}.</p>
 *
 * <p>The endpoint enforces a max batch size of 50. Call-sites must partition
 * larger ID lists before invoking this client.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-19
 */
@FeignClient(name = "venue-manager", contextId = "venueClient",
        path = "/api/v1/venues", configuration = ServiceFeignConfig.class)
public interface VenueClient {

    /**
     * Retrieves venue details for up to 50 venue IDs in a single request.
     *
     * @param ids the list of venue UUIDs to look up (max 50)
     * @return a list of {@link VenueDetailsDto} for the matched venues
     */
    @PostMapping("/bulk")
    List<VenueDetailsDto> getBulkVenues(@RequestBody List<String> ids);
}
