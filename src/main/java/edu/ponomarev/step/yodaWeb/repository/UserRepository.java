package edu.ponomarev.step.yodaWeb.repository;

import edu.ponomarev.step.yodaWeb.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  UserDetails findByUsername(String username);
}
