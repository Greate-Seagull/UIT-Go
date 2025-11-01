# ---------- Stage 1: Build ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy wrapper + cấu hình trước để tận dụng cache
COPY gradlew ./
COPY gradle ./gradle
COPY settings.gradle build.gradle ./

# Cho phép thực thi wrapper
RUN chmod +x gradlew

# (tuỳ) Khởi tạo cache Gradle
RUN ./gradlew --no-daemon --version

# Copy source và build
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy JAR từ stage build
COPY --from=build /app/build/libs/*.jar app.jar

# Lắng nghe port app
EXPOSE 8082

# Bật profile docker để dùng application-docker.yml
ENV SPRING_PROFILES_ACTIVE=docker

# (tuỳ) truyền tiếp biến kết nối nếu muốn override từ compose
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://trip-postgres:5432/tripdb \
    SPRING_DATASOURCE_USERNAME=user \
    SPRING_DATASOURCE_PASSWORD=pass

ENTRYPOINT ["java","-jar","/app/app.jar"]
