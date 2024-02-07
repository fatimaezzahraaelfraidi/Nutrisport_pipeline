package com.example.usermanagementservice.service;


import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.Location;
import com.example.usermanagementservice.repository.LocationRepository;
import lombok.AllArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;

@Service
@AllArgsConstructor
public class LocationService {
    @Autowired
    private final LocationRepository locationRepository;

    public void save(Location location)
    {
        locationRepository.save(location);
    }
    public void saveAndFlush(Location location)
    {
        locationRepository.saveAndFlush(location);
    }

}
