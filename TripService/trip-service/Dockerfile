
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN ./gradlew --version || true
COPY src ./src
RUN ./gradlew --no-daemon bootJar || (echo "Use local Gradle: ./gradlew bootJar" && exit 0)

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
