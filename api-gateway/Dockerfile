# ---------- Stage 1: Build ----------
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy wrapper + maven configuration
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Allow execution
RUN chmod +x mvnw

# Resolve dependencies
RUN ./mvnw dependency:go-offline

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8989

ENTRYPOINT ["java","-jar","/app/app.jar"]
