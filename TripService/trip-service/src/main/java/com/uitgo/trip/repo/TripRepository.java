
package com.uitgo.trip.repo;

import com.uitgo.trip.domain.Trip;
import com.uitgo.trip.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByPassengerId(Long passengerId);
    List<Trip> findByStatus(TripStatus status);
}
