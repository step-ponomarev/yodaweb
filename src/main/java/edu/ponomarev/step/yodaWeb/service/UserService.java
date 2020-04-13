package edu.ponomarev.step.yodaWeb.service;

import edu.ponomarev.step.yodaWeb.domain.User;
import edu.ponomarev.step.yodaWeb.dto.UserDto;
import edu.ponomarev.step.yodaWeb.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

  public boolean addUser(UserDto userDto) {
    User user = new User(
        userDto.getUsername(),
        passwordEncoder.encode(userDto.getPassword()),
        userDto.getUserRole());

    var userWithThisName = loadUserByUsername(user.getUsername());

    if (userWithThisName != null) {
      return false;
    }

    userRepository.save(user);

    return true;
  }

  public UserDto currentUser()  {
    var user = (User) SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    return new UserDto(
        user.getUsername(),
        user.getPassword(),
        user.getRoleSet()
    );
  }
}
