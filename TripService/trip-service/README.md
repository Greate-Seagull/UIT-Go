
# UIT-Go TripService (Spring Boot)

## Run locally
1. Ensure Postgres is running (e.g., from docker-compose with service `trip-postgres`).
2. Build:
   ```bash
   ./gradlew bootJar   # or: gradle bootJar
   java -jar build/libs/trip-service-0.0.1-SNAPSHOT.jar
   ```
3. Test endpoints with the Postman collection in this repo.

## Environment
- `spring.datasource.url=jdbc:postgresql://trip-postgres:5432/tripdb`
- `spring.datasource.username=user`
- `spring.datasource.password=pass`

## Notes
- Offer timeout every 1s.
- SSE at `/trips/{id}/events` pushes `status` and a stub `driver_location`.
