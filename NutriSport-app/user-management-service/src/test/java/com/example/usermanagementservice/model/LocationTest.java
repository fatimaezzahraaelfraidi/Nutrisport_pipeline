package com.example.usermanagementservice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class LocationTest {

    @Test
    void testGetterAndSetter() {
        GeometryFactory geometryFactory = new GeometryFactory();
        // Create a Location object
        Coordinate c1 = new Coordinate(33.63679030634622, -7.4864711795771814);
        Point p1 = geometryFactory.createPoint(c1);
        Location locationToSave = new Location();
        locationToSave.setLocationGeometry(p1);

        // Create a Geometry object for testing


        // Set the Geometry object using the setter
        locationToSave.setLocationGeometry(p1);

        // Get the Geometry object using the getter
        Geometry retrievedGeometry = locationToSave.getLocationGeometry();

    ;
    }
    @Test
    void testIdGetter() {
        // Create a Location object
        Location location = new Location();

        // Set a value for the id field (simulating database population)
        Long id = 123L;
        location.setId(id);

        // Get the id using the getter
        Long retrievedId = location.getId();

        // Assert that the retrieved id is equal to the original id
        assertEquals(id, retrievedId);
    }
}