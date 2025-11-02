
package com.uitgo.trip.repo;

import com.uitgo.trip.domain.TripRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripRatingRepository extends JpaRepository<TripRating, Long> { }
