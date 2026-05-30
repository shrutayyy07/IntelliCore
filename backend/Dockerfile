# ── Stage 1: Build JAR ──────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first (only re-runs if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Lean runtime with Java + Python ─────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install Python3 + pip + Pillow (lightweight fallback for blur detection)
# python3-opencv is huge; use Pillow as default, opencv optional
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-pil \
    && pip3 install --no-cache-dir Pillow --break-system-packages 2>/dev/null || true \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy Python scripts
COPY src/main/python ./src/main/python

# Create persistent data directories
RUN mkdir -p /app/data/uploads

# ── Environment defaults (overridden by Railway env vars) ─────────────────────
ENV PORT=8080
ENV STORAGE_PATH=/app/data
ENV PYTHON_SCRIPT_PATH=/app/src/main/python/blur_detection.py
ENV PYTHON_EXECUTABLE=python3
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Use shell form so $JAVA_OPTS and $PORT are expanded at runtime
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=$PORT -jar app.jar"]
