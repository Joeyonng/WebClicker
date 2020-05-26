import {createStore} from 'redux';

export const CHANGE_ACTIVITY = 'CHANGE_ACTIVITY';
export const CHANGE_ACCOUNT = 'CHANGE_ACCOUNT';
export const CHANGE_COURSES = 'CHANGE_COURSES';
export const CHANGE_SESSIONS = 'CHANGE_SESSIONS';
export const CHANGE_POLLS = 'CHANGE_POLLS';

export const changeActivity = (data) => ({
    type: CHANGE_ACTIVITY,
    data,
});

export const changeAccount = (data) => ({
    type: CHANGE_ACCOUNT,
    data,
});

export const changeCourses = (data) => ({
    type: CHANGE_COURSES,
    data,
});

export const changeSessions = (data) => ({
    type: CHANGE_SESSIONS,
    data,
});

export const changePolls = (data) => ({
    type: CHANGE_POLLS,
    data,
});

let initialState = {
    /*
    {
        accountID: 'Joeyonng',
        accountName: 'Litao Qiao',
        accountType: 'instructor',
    }
     */
    account: {},

    /*
     {
         activityCourseID: 'testCourseID',
         activitySessionID: 'testSessionID',
         activityPollID: 'testPollID',
     }
     */
    activity: {},

    /*
     courseID: {
         courseID: 'testCourseID',
         courseName: 'testCourseName',
         courseCategories: {
            'testCategoryName': [
                'testOptionName',
            ]
         },
         courseSessionID: 'testCourseSessionID',
         coursePollID: 'testCoursePollID',
         students: [],
     };
     */
    courses: {},

    /*
     sessionID: {
         sessionID: 'testSessionID' + i,
         sessionIndex: i,
         sessionStartTime: 123456789,
         sessionCourseID: 'testCourseID' + i,
     };
     */
    sessions: {},

    /*
     pollID: {
         pollID: 'testPollID' + i,
         pollIndex: i,
         pollStartTime: 123456789,
         pollSessionID: 'testSessionID' + i,
         pollVotedColor: '#123456',
     };
     */
    polls: {},
};

export const reducer = (state=initialState, action) => {
    switch (action.type) {
        case CHANGE_ACTIVITY: {
            let newActivity = action.data;
            return Object.assign({}, state, {
                activity: newActivity,
            });
        }
        case CHANGE_ACCOUNT: {
            let newAccount = action.data;
            return Object.assign({}, state, {
                account: newAccount,
            })
        }
        case CHANGE_COURSES: {
            let newCourses = action.data;
            return Object.assign({}, state, {
                courses: newCourses,
            });
        }
        case CHANGE_SESSIONS: {
            let newSessions = action.data;
            return Object.assign({}, state, {
                sessions: newSessions,
            });
        }
        case CHANGE_POLLS: {
            let newPolls = action.data;
            return Object.assign({}, state, {
                polls: newPolls,
            });
        }
        default:
            return state;
    }
};

export const store = createStore(reducer);
