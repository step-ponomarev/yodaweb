package edu.ponomarev.step.yodaWeb.controller;

import edu.ponomarev.step.yodaWeb.domain.Task;
import edu.ponomarev.step.yodaWeb.dto.TaskDto;
import edu.ponomarev.step.yodaWeb.service.TaskService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("task")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @GetMapping
  public List<Task> getTasks() {
    return taskService.getTasks();
  }

  @PostMapping
  public Task saveTask(@RequestBody TaskDto taskDto) {
    return taskService.saveTask(taskDto);
  }

  @PutMapping
  public Task updateTask(@RequestBody TaskDto taskDto) {
    return taskService.updateTask(taskDto);
  }
}
