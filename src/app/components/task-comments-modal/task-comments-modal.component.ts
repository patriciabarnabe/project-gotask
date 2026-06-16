import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ɵɵDir } from '@angular/cdk/scrolling';
import { IComment } from '../../interfaces/comment.interface';
import { generateUniqueIdWithTimestamp } from '../../utils/generate-unique-id-with-timestamp';
import { ITask } from '../../interfaces/task.interface';

@Component({
  selector: 'app-task-comments-modal',
  imports: [ReactiveFormsModule, ɵɵDir],
  templateUrl: './task-comments-modal.component.html',
  styleUrl: './task-comments-modal.component.css',
})
export class TaskCommentsModalComponent {
  taskCommentsChanged = false;
  commentControl = new FormControl('', [Validators.required]);

  readonly _task: ITask = inject(DIALOG_DATA);
  readonly _dialogRef: DialogRef<boolean> = inject(DialogRef);

  onAddComment() {
    // Criar um comentário
    const newComment: IComment = {
      id: generateUniqueIdWithTimestamp(),
      description: this.commentControl.value ? this.commentControl.value : '',
    };

    // Adicionar o novo comentário na lista de comentários da tarefa
    this._task.comments.unshift(newComment);

    // Reset no form control
    this.commentControl.reset();

    // Atualizar a flag/prop se houve alteração nos comentários
    this.taskCommentsChanged = true;
  }

  onCloseModal() {
    // Fechar o modal e passar a informação se houve alteração nos comentários
    this._dialogRef.close(this.taskCommentsChanged);
  }
}
