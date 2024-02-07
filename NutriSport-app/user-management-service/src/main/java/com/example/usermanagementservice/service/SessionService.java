package com.example.usermanagementservice.service;


import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.Location;
import com.example.usermanagementservice.model.Session;
import com.example.usermanagementservice.repository.LocationRepository;
import com.example.usermanagementservice.repository.SessionRepository;
import com.example.usermanagementservice.repository.SportifRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor

public class SessionService{

    @Autowired
    private final SessionRepository sessionRepository;
    private final PageEventProducer pageEventProducer;

    public Session createSession(Session session) {
        ////part to remove
        //--> start
        GeometryFactory geometryFactory = new GeometryFactory();

        //<-- end
        System.out.println("send new Session");
        Session newSession=sessionRepository.save(session);
        //Location ll1 = saveLocation(geometryFactory, new Coordinate(33.599154, -7.615456),newSession);
        pageEventProducer.sendSessionEvent(newSession);
        System.out.println("sifetha");
        return newSession;
    }

    public Session createSession(Account account, String token,String fcmToken, Date startTime, Date endTime, boolean isAuthenticated) {
        Session session = new Session();
        session.setAccount(account);
        session.setToken(token);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setFcmToken(fcmToken);
        session.setIsAuthenticated(true);
        return createSession(session);
    }

    public Optional<Session> getSessionByToken(String token) {
        return sessionRepository.findByToken(token);
    }

    public void deleteSessionByToken(String token) {
        sessionRepository.deleteByToken(token);
    }

    public List<Session> getSessionsByAccountId(Long accountId) {
        return sessionRepository.findByAccount_Id(accountId);
    }

    public Session save(Session s){
        return sessionRepository.save(s);
    }

    public void saveAndFlush(Session session)
    {

        sessionRepository.save(session);
    }

}
