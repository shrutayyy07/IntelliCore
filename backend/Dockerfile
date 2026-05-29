# Multi-stage build: Java + Python runtime
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Python + OpenCV dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-opencv \
    && pip3 install Pillow --break-system-packages \
    && rm -rf /var/lib/apt/lists/*

# Copy JAR
COPY --from=build /app/target/*.jar app.jar

# Copy Python scripts
COPY src/main/python ./src/main/python

# Create data directory
RUN mkdir -p /app/data/uploads

ENV PORT=8080
ENV STORAGE_PATH=/app/data
ENV PYTHON_SCRIPT_PATH=/app/src/main/python/blur_detection.py
ENV PYTHON_EXECUTABLE=python3

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
