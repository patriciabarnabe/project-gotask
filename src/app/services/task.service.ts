import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { ITask } from '../interfaces/task.interface';
import { ITaskFormControls } from '../interfaces/task-form-controls.interface';
import { TaskStatusEnum } from '../enums/task-status.enum';
import { generateUniqueIdWithTimestamp } from '../utils/generate-unique-id-with-timestamp';
import { TaskStatus } from '../types/task-status';
import { IComment } from '../interfaces/comment.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Tarefas em A fazer
  private todoTasks$ = new BehaviorSubject<ITask[]>([]);
  readonly todoTasks = this.todoTasks$
    .asObservable()
    .pipe(map((tasks) => structuredClone(tasks)));

  // Tarefas em Fazendo
  private doingTasks$ = new BehaviorSubject<ITask[]>([]);
  readonly doingTasks = this.doingTasks$
    .asObservable()
    .pipe(map((tasks) => structuredClone(tasks)));

  // Tarefas em Concluído
  private doneTasks$ = new BehaviorSubject<ITask[]>([]);
  readonly doneTasks = this.doneTasks$
    .asObservable()
    .pipe(map((tasks) => structuredClone(tasks)));

  // Parâmetro vai ser desse tipo, porque é o que o formulário vai enviar no welcome section
  addTask(taskInfos: ITaskFormControls) {
    const newTask: ITask = {
      ...taskInfos,
      status: TaskStatusEnum.TODO,
      id: generateUniqueIdWithTimestamp(),
      comments: [],
    };

    const currentList = this.todoTasks$.value;

    this.todoTasks$.next([...currentList, newTask]);
  }

  updateTaskStatus(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    taskNextStatus: TaskStatus,
  ) {
    const currentTaskList = this.getGetTaskListByStatus(taskCurrentStatus);
    const nextTaskList = this.getGetTaskListByStatus(taskNextStatus);
    const currentTask = currentTaskList.value.find(
      (task) => task.id === taskId,
    );

    if (currentTask) {
      // Atualizando o status da tarefa
      currentTask.status = taskNextStatus;

      // Removendo a tarefa da lista atual
      const currentTaskListWithoutTask = currentTaskList.value.filter(
        (task) => task.id !== taskId,
      );

      // Atualizando a lista atual sem a tarefa
      currentTaskList.next([...currentTaskListWithoutTask]);

      // Adicionando a tarefa na nova lista
      nextTaskList.next([...nextTaskList.value, { ...currentTask }]);
    }
  }

  updateTaskNameAndDescription(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    newTaskName: string,
    newTaskDescription: string,
  ) {
    const currentTaskList = this.getGetTaskListByStatus(taskCurrentStatus);
    const currentTaskIndex = currentTaskList.value.findIndex(
      (task) => task.id === taskId,
    );

    if (currentTaskIndex > -1) {
      const updatedTaskList = [...currentTaskList.value];

      updatedTaskList[currentTaskIndex] = {
        ...updatedTaskList[currentTaskIndex],
        name: newTaskName,
        description: newTaskDescription,
      };

      currentTaskList.next(updatedTaskList);
    }
  }

  updateTaskComments(
    taskId: string,
    taskCurrentStatus: TaskStatus,
    newTaskComments: IComment[],
  ) {
    const currentTaskList = this.getGetTaskListByStatus(taskCurrentStatus);
    const currentTaskIndex = currentTaskList.value.findIndex(
      (task) => task.id === taskId,
    );

    if (currentTaskIndex > -1) {
      const updatedTaskList = [...currentTaskList.value];

      updatedTaskList[currentTaskIndex] = {
        ...updatedTaskList[currentTaskIndex],
        comments: newTaskComments,
      };

      currentTaskList.next(updatedTaskList);
    }
  }

  deleteTask(taskId: string, taskCurrentStatus: TaskStatus) {
    const currentTaskList = this.getGetTaskListByStatus(taskCurrentStatus);
    const newTaskList = currentTaskList.value.filter(
      (task) => task.id !== taskId,
    );
    currentTaskList.next(newTaskList);
  }

  private getGetTaskListByStatus(taskStatus: TaskStatus) {
    const taskListObj = {
      [TaskStatusEnum.TODO]: this.todoTasks$,
      [TaskStatusEnum.DOING]: this.doingTasks$,
      [TaskStatusEnum.DONE]: this.doneTasks$,
    };
    return taskListObj[taskStatus];
  }
}
// https://www.samanthaming.com/tidbits/70-3-ways-to-clone-objects/
