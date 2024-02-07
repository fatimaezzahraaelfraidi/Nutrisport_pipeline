# Use a base image with JRE
FROM openjdk:17
# Set the working directory in the container
WORKDIR /app

# Copy the JAR file into the container
COPY target/api-gateway-service-0.0.1-SNAPSHOT.jar /app/api-gateway-service.jar

# Command to run the application
CMD ["java", "-jar", "api-gateway-service.jar"]