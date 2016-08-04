var axios = require('axios');
var http = axios.create({
  baseURL: 'http://hipster-quiz-api.petarslovic.com',
  timeout: 1000
});

function getQuestion(id) {
  return http.get('/questions/' + id);
}

function submitAnswer(id, answer) {
  return http.post('/questions/' + id + '/answer', { answer: answer });
}

function searchQuizzes(q) {
  return http.get('/quizzes/search/'.concat(q));
}

exports.getQuestion = getQuestion;
exports.submitAnswer = submitAnswer;
exports.searchQuizzes = searchQuizzes;