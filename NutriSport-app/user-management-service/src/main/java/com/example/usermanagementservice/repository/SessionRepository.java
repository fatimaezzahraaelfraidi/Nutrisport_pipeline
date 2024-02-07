package com.example.usermanagementservice.repository;

import com.example.usermanagementservice.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface SessionRepository  extends JpaRepository<Session,Long> {
    Optional<Session> findByToken(String token);

    void deleteByToken(String token);

    List<Session> findByAccount_Id(Long accountId);


}
