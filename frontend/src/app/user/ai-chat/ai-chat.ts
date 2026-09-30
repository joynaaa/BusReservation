import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  AiService
} from '../../core/services/ai';


interface ChatMessage {

  sender: 'user' | 'ai';

  text: string;

}


@Component({

  selector: 'app-ai-chat',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './ai-chat.html',

  styleUrls: ['./ai-chat.css']

})


export class AiChat {


  // ======================================================
  // MESSAGE
  // ======================================================

  message = '';


  // ======================================================
  // LOADING
  // ======================================================

  loading = false;


  // ======================================================
  // CHAT MESSAGES
  // ======================================================

  messages: ChatMessage[] = [

    {
      sender: 'ai',

      text:
        '👋 Hi! I am BusGo AI Assistant. I can help you search buses, check availability, fares, bookings and payments.'
    }

  ];


  // ======================================================
  // CONTINUOUS CHAT CONTEXT
  // ======================================================

  chatContext: any = {

    source: null,

    destination: null,

    travel_date: null,

    buses: [],

    selected_bus: null,

    selected_schedule_id: null,

    selected_from_stop_id: null,

    selected_to_stop_id: null,

    available_seats: []

  };


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(

    private aiService: AiService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // ======================================================
  // SEND MESSAGE
  // ======================================================

  sendMessage(): void {


    const text =
      this.message.trim();


    if (
      !text ||
      this.loading
    ) {

      return;

    }


    // ====================================================
    // ADD USER MESSAGE
    // ====================================================

    this.messages.push({

      sender: 'user',

      text: text

    });


    // ====================================================
    // CLEAR INPUT
    // ====================================================

    this.message = '';


    // ====================================================
    // SHOW THINKING
    // ====================================================

    this.loading = true;


    this.cdr.detectChanges();


    // ====================================================
    // SEND MESSAGE + EXISTING CONTEXT
    // ====================================================

    this.aiService
      .sendMessage(

        text,

        this.chatContext

      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (response) => {


          console.log(
            'AI RESPONSE:',
            response
          );


          // -----------------------------------------------
          // UPDATE CONTEXT FROM DJANGO
          // -----------------------------------------------

          if (
            response.context
          ) {

            this.chatContext = {

              ...this.chatContext,

              ...response.context

            };

          }


          // -----------------------------------------------
          // AI ANSWER
          // -----------------------------------------------

          const aiResponse =

            response.message ||

            response.response ||

            'Sorry, I could not understand that.';


          // -----------------------------------------------
          // ADD AI MESSAGE
          // -----------------------------------------------

          this.messages.push({

            sender: 'ai',

            text: aiResponse

          });


          // -----------------------------------------------
          // STOP LOADING
          // -----------------------------------------------

          this.loading = false;


          this.cdr.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {


          console.error(
            'AI ERROR:',
            error
          );


          this.loading = false;


          this.messages.push({

            sender: 'ai',

            text:
              'Sorry, I could not connect to the AI service.'

          });


          this.cdr.detectChanges();

        }

      });

  }


  // ======================================================
  // ENTER
  // ======================================================

  onEnter(
    event: KeyboardEvent
  ): void {


    if (

      event.key === 'Enter' &&

      !event.shiftKey

    ) {

      event.preventDefault();

      this.sendMessage();

    }

  }


  // ======================================================
  // QUICK QUESTION
  // ======================================================

  askQuestion(
    question: string
  ): void {


    if (this.loading) {

      return;

    }


    this.message =
      question;


    this.sendMessage();

  }


  // ======================================================
  // HOME
  // ======================================================

  goHome(): void {

    this.router.navigate([
      '/home'
    ]);

  }

}