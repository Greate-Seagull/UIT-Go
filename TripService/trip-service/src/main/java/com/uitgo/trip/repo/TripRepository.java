
package com.uitgo.trip.repo;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByPassengerId(Long passengerId);
    List<Trip> findByStatus(TripStatus status);
}
