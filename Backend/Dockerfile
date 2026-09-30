# ===== Build stage =====
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# ===== Run stage =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/uploads /tmp/faruk-fashion-uploads \
    && chown -R app:app /app /tmp/faruk-fashion-uploads

COPY --from=build /app/target/*.jar app.jar
USER app

ENV SERVER_PORT=8080
EXPOSE 8080

# Faster / lower memory for Render free tier
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -Xss256k -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar app.jar"]