package com.example.usermanagementservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Geometry;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@Table(name = "locations")
public class Location  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "geography")
    private Geometry locationGeometry;

    public Geometry getLocationGeometry() {
        return locationGeometry;
    }
    public void setLocationGeometry(Geometry locationGeometry) {
        this.locationGeometry = locationGeometry;
    }
}

