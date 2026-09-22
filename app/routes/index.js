const user = require('./userRoutes');
const auth = require('./authRoutes');
const topic = require('./topicRoutes');
const subtopic =  require('./subtopicRoutes');
const question = require('./questionRoute');
const keyword = require('./keywordRoutes');
const material = require('./materialRoute');
const olympic = require('./olympicRoutes');
const olympicQuestion = require('./olympicQuestionRoute');
const olympicAssessment = require('./olympicAssessmentRoute');
module.exports =  {
    user,
    auth,
    topic,
    subtopic,
    question,
    keyword,
    material,
    olympic,
    olympicQuestion,
    olympicAssessment
}