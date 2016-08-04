var inquirer = require('inquirer');
var api = require('./api');

var _ = require('lodash');

var points = 0;

var questions = [{
  name: 'q',
  type: 'input',
  message: 'Type some text to search for quizzes... (hint: `try coffee`)',
  validate: function(value) {
    if (value.length) {
      return true;
    } else {
      return 'Please a search term';
    }
  }
}];

function createQuizChoice(quiz) {
  return {
    name: quiz.name + ' - ' + quiz.description,
    value: quiz._id
  };
}

function createQuizzesPrompt(choices) {
  return [{
    type: 'list',
    name: 'chosenQuiz',
    message: 'Choose one of the quizzes to play:',
    choices: choices
  }];
}

function createQuestionPrompt(question) {
  return [{
    type: 'list',
    name: 'answer',
    message: question.question,
    choices: question.answers
  }];
}

function addPoints(newPoints) {
  points += newPoints;
}

function showNextQuestion(quizzes, quizId, questionIndex) {
  var quiz = _.find(quizzes, { _id: quizId });
  if(!quiz) {
    throw Error('showNextQuestion - Invalid quizId');
  }

  if(questionIndex === quiz.questions.length) {
    console.log('You finished the quiz with ' + points + ' points!');
    return;
  }

  var questionId = quiz.questions[questionIndex];

  api
    .getQuestion(questionId)
    .then(function(response) {
      var question = response.data;

      inquirer
        .prompt(createQuestionPrompt(question))
        .then(function(answers) {
          var answered = answers.answer;

          api
            .submitAnswer(question._id, answered)
            .then(function(response) {
              var correct = response.data.correct;

              if(correct) {
                addPoints(100);
                console.log('\n\nCorrect! You now have ' + points + ' points.\n\n');
              } else {
                console.log('\n\nSorry no. You still have ' + points + ' points.\n\n');
              }

              showNextQuestion(quizzes, quizId, questionIndex + 1);
            })

        });
    });
}

function searchQuiz() {

  inquirer.prompt(questions).then(function(answers) {
    api
      .searchQuizzes(answers.q)
      .then(function(response) {
        var quizzes = response.data;
        var choices = _.map(quizzes, createQuizChoice);
        var quizzesPrompt = createQuizzesPrompt(choices);

        if(!choices.length) {
          console.log('There was no quizzes that match your search. Please try again.');
          searchQuiz();
          return;
        }

        inquirer.prompt(quizzesPrompt).then(function(answers) {
          console.log('\n\nStarting the quiz. Good luck! \n\n')
          showNextQuestion(quizzes, answers.chosenQuiz, 0);
        })
      })
      .catch(function(err) {
        console.log(err);
      })
  });
}

searchQuiz();