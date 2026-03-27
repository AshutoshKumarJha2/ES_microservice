package com.cts.eventsphere.vendormanager.exception.delivery;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DeliveryNotFoundException extends RuntimeException {
  public DeliveryNotFoundException(String message) {

      super(message);
      log.error(message);
  }
}
