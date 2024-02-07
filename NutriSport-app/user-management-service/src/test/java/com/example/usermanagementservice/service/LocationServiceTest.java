package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Location;
import com.example.usermanagementservice.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {
    private LocationService locationService;
    @Mock
    private LocationRepository locationRepository;
    private GeometryFactory geometryFactory ;
    @BeforeEach
    void setUp(){
        geometryFactory= new GeometryFactory();
        locationService=new LocationService(locationRepository);
    }

    @Test
    void save() {
        Coordinate c1 = new Coordinate(33.63679030634622, -7.4864711795771814);
        Point p1 = geometryFactory.createPoint(c1);
        Location locationToSave = new Location();
        locationToSave.setLocationGeometry(p1);
   // When
        locationService.save(locationToSave);

        // Then
        ArgumentCaptor<Location> locationArgumentCaptor = ArgumentCaptor.forClass(Location.class);
        verify(locationRepository).save(locationArgumentCaptor.capture());
        Location capturedLocation = locationArgumentCaptor.getValue();
        assertThat(capturedLocation).isEqualTo(locationToSave);
    }

    @Test
    void saveAndFlush() {
        Coordinate c1 = new Coordinate(33.63679030634622, -7.4864711795771814);
        Point p1 = geometryFactory.createPoint(c1);
        Location locationToSave = new Location();
        locationToSave.setLocationGeometry(p1);
        // When
        locationService.saveAndFlush(locationToSave);

        // Then
        ArgumentCaptor<Location> locationArgumentCaptor = ArgumentCaptor.forClass(Location.class);
        verify(locationRepository).saveAndFlush(locationArgumentCaptor.capture());
        Location capturedLocation = locationArgumentCaptor.getValue();
        assertThat(capturedLocation).isEqualTo(locationToSave);
    }

}