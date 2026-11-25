
# ================================
# BUILD STAGE
# ================================
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests


# ================================
# RUNTIME STAGE
# ================================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar doms.jar

# Application port
EXPOSE 8080

# JVM configuration
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

# Start Spring Boot application
ENTRYPOINT ["java","-jar","doms.jar"]
