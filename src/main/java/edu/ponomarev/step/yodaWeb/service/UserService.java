package edu.ponomarev.step.yodaWeb.service;

import edu.ponomarev.step.yodaWeb.config.security.UserRole;
import edu.ponomarev.step.yodaWeb.domain.User;
import edu.ponomarev.step.yodaWeb.dto.UserDto;
import edu.ponomarev.step.yodaWeb.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserService implements UserDetailsService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    return userRepository.findByUsername(username);
  }

  public User addUser(UserDto userDto) {

    User user = new User(
        userDto.getUsername(),
        passwordEncoder.encode(userDto.getPassword()),
        Set.of(UserRole.USER));


    return userRepository.save(user);
  }
}
