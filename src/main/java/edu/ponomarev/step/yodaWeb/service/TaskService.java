package edu.ponomarev.step.yodaWeb.service;

import edu.ponomarev.step.yodaWeb.domain.Task;
import edu.ponomarev.step.yodaWeb.domain.User;
import edu.ponomarev.step.yodaWeb.dto.TaskDto;
import edu.ponomarev.step.yodaWeb.repository.TaskRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {
  private final TaskRepository taskRepository;

  public TaskService(TaskRepository taskRepository) {
    this.taskRepository = taskRepository;
  }

  public List<Task> getTasks() {
    var user = (User) SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    return taskRepository.findByCreator(user);
  }

  public Task saveTask(TaskDto taskDto) {
    var user = (User) SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    taskDto.setCreator(user);

    var task = Task.builder()
        .completed(false)
        .statement(taskDto.getStatement())
        .dateOfCreation(taskDto.getDateOfCreation())
        .dateOfFinish(taskDto.getDateOfFinish())
        .creator(taskDto.getCreator())
        .container(taskDto.getContainer())
        .build();

    return taskRepository.save(task);
  }

  public Task updateTask(TaskDto taskDto) {
    var task = taskRepository.getOne(taskDto.getId());

    task.setCompleted(taskDto.isCompleted());
    task.setStatement(taskDto.getStatement());
    task.setDateOfFinish(taskDto.getDateOfFinish());
    task.setContainer(taskDto.getContainer());

    return taskRepository.save(task);
  }

  public void deleteTask(TaskDto taskDto) {
    var task = taskRepository.getOne(taskDto.getId());

    taskRepository.delete(task);
  }
}
