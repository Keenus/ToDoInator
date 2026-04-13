import {ChangeDetectionStrategy, Component, signal, effect, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'survival_todos';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MatIconModule],
  templateUrl: './app.html',
})
export class App {
  todos = signal<Todo[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Load initial data from localStorage if available
    if (this.isBrowser) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.todos.set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse todos from local storage', e);
          this.setInitialTodos();
        }
      } else {
        this.setInitialTodos();
      }
    } else {
      this.setInitialTodos();
    }

    // Save data to localStorage whenever the signal changes
    effect(() => {
      const currentTodos = this.todos();
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTodos));
      }
    });
  }

  private setInitialTodos() {
    this.todos.set([
      { id: '1', text: 'Zbudować szałas', completed: true },
      { id: '2', text: 'Znaleźć czystą wodę', completed: false },
      { id: '3', text: 'Rozpalić ognisko', completed: false }
    ]);
  }

  addTodo(input: HTMLInputElement) {
    const text = input.value.trim();
    if (!text) return;
    
    this.todos.update(t => [...t, { 
      id: crypto.randomUUID(), 
      text, 
      completed: false 
    }]);
    
    input.value = '';
  }

  toggleTodo(id: string) {
    this.todos.update(t => t.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }

  deleteTodo(id: string) {
    this.todos.update(t => t.filter(todo => todo.id !== id));
  }
}
