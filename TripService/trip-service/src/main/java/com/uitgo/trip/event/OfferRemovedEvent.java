package com.uitgo.trip.event;

import com.uitgo.trip.domain.Offer;
import org.springframework.context.ApplicationEvent;

public class OfferRemovedEvent extends ApplicationEvent {
    private final Offer offer;

    public OfferRemovedEvent(Object source, Offer offer) {
        super(source);
        this.offer = offer;
    }

    public Offer getOffer() {
        return offer;
    }
}

