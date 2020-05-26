import {firebaseConfig} from "./credentials";
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

export const initFirebase = () => {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

    /*
    firebase.firestore().enablePersistence().catch((err) => {
        console.log(err)
    });
     */
};

export const listenAuthorization = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                if(user.isAnonymous) {
                    let account = {};

                    account['accountID'] = user.uid;
                    account['accountEmail'] = '';
                    account['accountName'] = 'Anonymous';
                    account['accountType'] = 'student';

                    resolve(account);
                }
                else {
                    firebase.app().firestore().collection('accounts').where('email', '==', user.email).get().then(query => {
                        let account = {};

                        account['accountID'] = query.docs[0].id;
                        account['accountEmail'] = query.docs[0].get('email');
                        account['accountName'] = query.docs[0].get('name');
                        account['accountType'] = query.docs[0].get('type');

                        resolve(account);
                    });
                }
            } else {
                reject()
            }
        });
    });
};

export const anonymousSignIn = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().signInAnonymously().then(userCredential => {
            let account = {};

            account['accountID'] = userCredential.user.uid;
            account['accountEmail'] = '';
            account['accountName'] = 'Anonymous';
            account['accountType'] = 'student';

            resolve(account);
        }).catch(err => {
            console.log(err.code, err.message);
        });
    });
};

export const signIn = (data) => {
    let email = data.email;
    let password = data.password;

    return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(email, password).then(userCredential => {
            firebase.app().firestore().collection('accounts').where('email', '==', email).get().then(query => {
                let account = {};

                account['accountID'] = query.docs[0].id;
                account['accountEmail'] = query.docs[0].get('email');
                account['accountName'] = query.docs[0].get('name');
                account['accountType'] = query.docs[0].get('type');

                resolve(account);
            });
        }).catch(err => {
            switch(err.code) {
                case 'auth/invalid-email':
                    reject({emailError: err.message});
                    break;
                case 'auth/user-not-found':
                    reject({emailError: err.message});
                    break;
                case 'auth/wrong-password':
                    reject({passwordError: err.message});
                    break;
                default:
                    console.log(err.code, err.message);
            }
        });
    });
};

export const signUp = (data) => {
    let email = data.email;
    let password = data.password;
    let name = data.name;
    let note = data.note;
    let type = data.type;

    return new Promise((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
            firebase.app().firestore().collection('accounts').doc().set({
                email: email,
                name: name,
                note: note,
                type: type,
            }).then(() => {
                firebase.app().firestore().collection('accounts').where('email', '==', email).get().then(query => {
                    let account = {};

                    account['accountID'] = query.docs[0].id;
                    account['accountEmail'] = query.docs[0].get('email');
                    account['accountName'] = query.docs[0].get('name');
                    account['accountType'] = query.docs[0].get('type');

                    resolve(account);
                });
            });
        }).catch(err => {
            switch(err.code) {
                case 'auth/email-already-in-use':
                    reject({emailError: err.message,});
                    break;
                case 'auth/invalid-email':
                    reject({emailError: err.message,});
                    break;
                case 'auth/weak-password':
                    reject({passwordError: err.message,});
                    break;
                default:
                    console.log(err.code, err.message);
                    reject(err);
            }
        });
    })
};

export const signOut = () => {
    return new Promise((resolve, reject) => {
        firebase.auth().signOut().then(() => {
            resolve();
        }).catch(err => {
            console.log(err)
        })
    })
};

/*
 Course-related functions
 */
const getCourse = (doc) => {
    let course = {};

    course['courseID'] = doc.id;
    course['courseName'] = doc.get('courseName');
    course['courseQuarter'] = doc.get('courseQuarter');
    course['courseCategories'] = doc.get('courseCategories');
    course['courseInstructorID'] = doc.get('courseInstructorID');
    course['courseActivitySessionID'] = doc.get('courseActivitySessionID');
    course['courseActivityPollID'] = doc.get('courseActivityPollID');
    course['courseActivityPollLive'] = doc.get('courseActivityPollLive');
    course['courseActivityPollDisplay'] = doc.get('courseActivityPollDisplay');
    course['students'] = doc.get('students');

    return course;
};

export const listenCourseActivity = (data) => {
    let courseID = data.courseID;
    let action = data.action;

    return firebase.firestore().collection('courses').doc(courseID).onSnapshot(docSnapshot => {
        let course = getCourse(docSnapshot);
        action(course);
    });
};

export const fetchCourses = (data) => {
    let accountID = data.accountID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('accounts').doc(accountID).get().then(doc => {
            let coursesRef;

            if(doc.get('type') === 'instructor') {
                coursesRef = firebase.firestore().collection('courses').where('courseInstructorID', '==', accountID).get();
            }
            else if(doc.get('type') === 'student') {
                let studentCourses = doc.get('studentCourses');
                if (studentCourses === undefined || studentCourses.length === 0) {
                    resolve({});
                }
                else {
                    coursesRef = firebase.firestore().collection('courses').where(firebase.firestore.FieldPath.documentId(), "in", studentCourses).get();
                }
            }

            coursesRef.then(query => {
                let courses = {};

                query.forEach((doc) => {
                    let course = getCourse(doc);
                    courses[doc.id] = course;
                });

                resolve(courses);
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        });
    });
};

export const searchCourses = (data) => {
    let keyword = data.keyword;

    return new Promise((resolve, reject) => {
        if (keyword === '' || keyword === undefined) {
            resolve({})
        }
        else {
            firebase.firestore().collection('courses').where('courseName', '>=', keyword).get().then(query => {
                let courses = {};

                query.forEach((doc) => {
                    let course = getCourse(doc);
                    courses[doc.id] = course;
                });

                resolve(courses);
            }).catch(err => {
                console.log(err);
            });
        }
    })
};

export const createCourse = (data) => {
    let courseName = data.courseName;
    let courseQuarter = data.courseQuarter;
    let courseCategories = data.courseCategories;
    let courseInstructorID = data.courseInstructorID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').add({
            courseName: courseName,
            courseQuarter: courseQuarter,
            courseCategories: courseCategories,
            courseInstructorID: courseInstructorID,
            courseActivitySessionID: '',
            courseActivityPollID: '',
            courseActivityPollLive: false,
            courseActivityPollDisplay: false,
            students: []
        }).then(course => {
            resolve(course.id);
        }).catch(err => {
            console.log(err);
        });
    })
};

export const checkCourseCode = (data) => {
    let courseCode = data.courseCode;
    let accountID = data.accountID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').where('courseCode', '==', courseCode).limit(1).get().then(query => {
            if (query.empty) {
                resolve("Invalid code.");
            } else {
                let courseRef = query.docs[0].ref;
                let courseStudentInfo = courseRef.collection('students').doc(accountID);
                if (!courseStudentInfo.exists) {
                    // TODO: Add message stating the student is already enrolled
                    resolve("Already enrolled.");
                } else {
                    courseRef.collection('students').doc(accountID).set({
                        studentCategories: {
                            // TODO: Currently replaces all information when entered
                            // TODO: Does not automatically update courses list unless refreshed
                        },
                        studentID: accountID,
                    }).then(() => {
                        let courseId = courseRef.id;
                        firebase.firestore().collection('accounts').doc(accountID).update({
                            studentCourses: firebase.firestore.FieldValue.arrayUnion(courseId)
                        }).then(() => {
                            resolve("Success.");
                        });
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
        }).catch((err) => {
            console.log(err);
        });
    });
};

export const fetchCourseStudents = (data) => {
    let courseID = data.courseID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').doc(courseID).collection('students').get().then(query => {
            let students = {};

            query.forEach((doc) => {
                let student = {};
                student['studentID'] = doc.id;
                student['studentCategories'] = doc.get('studentCategories');
                students[doc.id] = student;
            });

            resolve(students);
        }).catch(err => {
            console.log(err);
        });
    });
};

export const setCourseStudents = (data) => {
    let courseID = data.courseID;
    let students = data.students;

    return new Promise((resolve, reject) => {
        let promises = [];
        for(let studentID in students) {
            let promise = firebase.firestore().collection('courses').doc(courseID).collection('students').doc(studentID).set({
                studentID: students[studentID]['studentID'],
                studentCategories: students[studentID]['studentCategories'],
            });
            promises.push(promise);
        }

        Promise.all(promises).then(() => {
            resolve();
        }).catch(err => {
            console.log(err);
        });
    });
};

/*
 Session-related functions
 */
export const fetchSessions = (data) => {
    let courseID = data.courseID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('sessions').where('sessionCourseID', '==', courseID).orderBy("sessionStartTime").get().then(query => {
            let sessions = {};

            let index = 0;
            query.forEach((doc) => {
                let session = {};
                session['sessionID'] = doc.id;
                session['sessionIndex'] = ++index;
                session['sessionStartTime'] = doc.get('sessionStartTime');
                session['sessionCourseID'] = doc.get('sessionCourseID');
                sessions[doc.id] = session;
            });

            resolve(sessions);
        }).catch(err => {
            console.log(err);
        });
    });
};

export const createSession = (data) => {
    let sessionStartTime = data.sessionStartTime;
    let sessionCourseID = data.sessionCourseID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('sessions').add({
            sessionStartTime: sessionStartTime,
            sessionCourseID: sessionCourseID,
        }).then(session => {
            resolve(session.id);
        }).catch(err => {
            console.log(err);
        });
    })
};

export const activateSession = (data) => {
    let sessionID = data.sessionID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('sessions').doc(sessionID).get().then(session => {
            firebase.firestore().collection('courses').doc(session.get('sessionCourseID')).update({
                courseActivitySessionID: session.id,
                courseActivityPollID: '',
                courseActivityPollLive: false,
                courseActivityPollDisplay: false,
            }).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });

            resolve();
        }).catch(err => {
            console.log(err);
        });
    });
};

export const deactivateSession = (data) => {
    let courseID = data.courseID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').doc(courseID).update({
            courseActivitySessionID: '',
            courseActivityPollID: '',
            courseActivityPollLive: false,
            courseActivityPollDisplay: false,
        }).then(() => {
            resolve()
        }).catch(err => {
            console.log(err);
        });
    });
};

/*
 Poll-related functions
 */
const getPoll = (pollDoc) => {
    let poll = {};
    poll['pollID'] = pollDoc.id;
    poll['pollStartTime'] = pollDoc.get('pollStartTime');
    poll['pollSessionID'] = pollDoc.get('pollSessionID');
    poll['pollVotedColor'] = pollDoc.get('pollVotedColor');
    poll['pollCategories'] = pollDoc.get('pollCategories');

    return poll
};

export const fetchPolls = (data) => {
    let sessionID = data.sessionID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('polls').where('pollSessionID', '==', sessionID).orderBy('pollStartTime', 'asc').get().then(pollDocs => {
            let polls = {};

            let index = 0;
            pollDocs.forEach(pollDoc => {
                let poll = getPoll(pollDoc);
                poll['pollIndex'] = ++index;
                polls[pollDoc.id] = poll;
            });

            resolve(polls);
        }).catch((err) => {
            console.log(err);
        });
    });
};

export const fetchPoll = (data) => {
    let pollID = data.pollID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('polls').doc(pollID).get().then(pollDoc => {
            let poll = getPoll(pollDoc);

            resolve(poll);
        }).catch((err) => {
            console.log(err);
        });
    });
};

export const createPoll = (data) => {
    let pollStartTime = data.pollStartTime;
    let pollSessionID = data.pollSessionID;
    let pollVotedColor = data.pollVotedColor;
    let pollCategories = data.pollCategories;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('polls').add({
            pollStartTime: pollStartTime,
            pollSessionID: pollSessionID,
            pollVotedColor: pollVotedColor,
            pollCategories: pollCategories,
        }).then(poll => {
            resolve(poll.id);
        }).catch(err => {
            console.log(err);
        });
    })
};

export const activatePoll = (data) => {
    let pollID = data.pollID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('polls').doc(pollID).get().then(poll => {
            firebase.firestore().collection('sessions').doc(poll.get('pollSessionID')).get().then(session => {
                firebase.firestore().collection('courses').doc(session.get('sessionCourseID')).update({
                    courseActivityPollID: poll.id,
                    courseActivityPollLive: true,
                }).then(() => {
                    resolve();
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    });
};

export const deactivatePoll = (data) => {
    let courseID = data.courseID;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').doc(courseID).update({
            courseActivityPollLive: false,
            courseActivityPollDisplay: false,
        }).then(() => {
            resolve();
        }).catch(err => {
            console.log(err)
        });
    });
};

export const displayPoll = (data) => {
    let courseID = data.courseID;
    let displayPoll = data.displayPoll;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('courses').doc(courseID).update({
            courseActivityPollDisplay: displayPoll,
        }).then(() => {
            resolve();
        }).catch(err => {
            console.log(err)
        });
    });
};

export const listenPollStudents = (data) => {
    /*
     studentID: 'testStudentID' + i,
     studentVote: 'A',
     studentCategories: {
        'testCategoryName': 'testOptionName'
     },
     */
    let pollID = data.pollID;
    let action = data.action;

    return firebase.firestore().collection('polls').doc(pollID).collection('students').onSnapshot(querySnapshot => {
        let students = {};
        querySnapshot.forEach((doc) => {
            students[doc.id] = {
                studentID: doc.id,
                studentVote: doc.get('studentVote'),
                studentCategories: doc.get('studentCategories')
            };
        });
        action(students);
    });
};

/*
 Student-specific functions
 */
export const setPollStudent = (data) => {
    let pollID = data.pollID;
    let studentID = data.studentID;
    let vote = data.vote;

    return new Promise((resolve, reject) => {
        firebase.firestore().collection('polls').doc(pollID).get().then(pollDoc => {
            firebase.firestore().collection('sessions').doc(pollDoc.get('pollSessionID')).get().then(sessionDoc => {
                firebase.firestore().collection('courses').doc(sessionDoc.get('sessionCourseID')).collection('students').doc(studentID).get().then(studentDoc => {
                    firebase.firestore().collection('polls').doc(pollID).collection('students').doc(studentID).set({
                        studentID: studentID,
                        studentVote: vote,
                        studentCategories: studentDoc.get('studentCategories'),
                    }).then(() => {
                        resolve();
                    }).catch(err => {
                        console.log(err);
                    });
                })
            })
        });
    });
};

export const saveStudentCourse = (data) => {
    let courseID = data.courseID;
    let studentID = data.studentID;

    // TODO: Update course to include student in students array
    return new Promise((resolve, reject) => {
        firebase.firestore().collection('accounts').doc(studentID).update({
            studentCourses: firebase.firestore.FieldValue.arrayUnion(courseID)
        }).then(() => {
            resolve();
        }).catch(err => {
            console.log(err);
        });
    });
};