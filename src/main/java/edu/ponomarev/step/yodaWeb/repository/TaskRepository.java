package edu.ponomarev.step.yodaWeb.repository;

import edu.ponomarev.step.yodaWeb.domain.Task;
import edu.ponomarev.step.yodaWeb.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByCreator(User creator);
}
