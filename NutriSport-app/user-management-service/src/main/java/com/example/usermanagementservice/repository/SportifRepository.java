package com.example.usermanagementservice.repository;

import com.example.usermanagementservice.model.Sportif;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SportifRepository extends JpaRepository<Sportif,Long> {
}
