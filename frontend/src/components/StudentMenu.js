import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import TextField from "@material-ui/core/TextField";
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';

import {changeAccount, changeCourses} from "../redux";
import {fetchCourses, saveStudentCourse, searchCourses, signOut, checkCourseCode} from "../firebaseApi";
import SelectInput from '@material-ui/core/Select/SelectInput';

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    headerListItem: {
        height: 64,
        [theme.breakpoints.down('xs')]: {
            height: 56,
        },
    },
    drawer: {
        width: 260, zIndex: 1,
    },
    search: {
        margin: "12px",
    },
});

class StudentMenu extends Component {
    constructor(props) {
        super(props);
        //console.log("StudentMenu Constructor", this.props);

        this.state = {
            searchCourses: [],
            courseCode: "",
            courseCodeText: "Course code",
        };
    }

    componentDidMount() {
        //console.log('StudentMenu: componentDidMount', this.props);

        if (this.props.account.accountID !== undefined && this.props.account.accountID !== '' && this.props.account.accountEmail !== '') {
            let data = {
                accountID: this.props.account.accountID,
            };

            fetchCourses(data).then(courses => {
                this.props.changeCourses(courses)
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('StudentMenu: componentDidUpdate', prevProps, this.props);

        if (this.props.account.accountID !== prevProps.account.accountID) {
            if (this.props.account.accountID !== undefined && this.props.account.accountID !== '' && this.props.account.accountEmail !== '') {
                let data = {
                    accountID: this.props.account.accountID,
                };

                fetchCourses(data).then(courses => {
                    this.props.changeCourses(courses)
                });
            }
        }
    }

    componentWillUnmount() {
        //console.log('InstructorMenu: componentWillUnmount');
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Drawer
                    classes={{paper: this.props.classes.drawer}}
                    anchor="left"
                    variant={mobile ? "temporary" : "persistent"}
                    open={this.props.open}
                    onClose={() => {
                        this.props.openCtl(false);
                    }}
                >
                    {mobile ? null : <div className={this.props.classes.appBarSpacer}/>}

                    <ListItem className={this.props.classes.headerListItem}>
                        <ListItemText
                            primary={this.props.account.accountName}
                            secondary={this.props.account.accountEmail}
                        />
                        <IconButton
                            onClick={() => {
                                signOut().then(() => {
                                    this.props.changeAccount({});
                                    this.props.history.push('/login')
                                })
                            }}
                        >
                            <ExitToAppIcon/>
                        </IconButton>
                    </ListItem>

                    <Divider/>

                    {this.props.account.accountEmail === '' ? null :
                        <div>
                            <List
                                subheader={<ListSubheader>Saved Courses</ListSubheader>}
                            >
                                {Object.values(this.props.courses).map(course =>
                                    <ListItem
                                        key={course.courseName}
                                        button
                                        selected={this.props.match.params.courseID === course.courseID}
                                        onClick={() => {
                                            this.props.history.push('/student/' + course.courseID);
                                            if (mobile) {
                                                this.props.openCtl(false);
                                            }
                                        }}
                                    >
                                        <ListItemText primary={course.courseName}/>
                                    </ListItem>
                                )}
                            </List>

                            <Divider/>
                        </div>
                    }

                    <TextField
                        className={this.props.classes.search}
                        variant="outlined"
                        size="small"
                        label="Search Courses"
                        onChange={(event) => {
                            let data = {
                                keyword: event.target.value,
                            };

                            searchCourses(data).then(courses => {
                                this.setState({searchCourses: courses})
                            });
                        }}
                    />

                    <List>
                        {Object.values(this.state.searchCourses).map(course =>
                            <ListItem
                                key={course.courseName}
                                button
                                onClick={() => {
                                    if (this.props.account.accountEmail !== '') {
                                        let data = {
                                            accountID: this.props.account.accountID,
                                            courseID: course.courseID,
                                        };

                                        saveStudentCourse(data);
                                    }

                                    this.props.history.push('/student/' + course.courseID);
                                    if(mobile) {
                                        this.props.openCtl(false);
                                    }

                                }}
                            >
                                <ListItemText primary={course.courseName} />
                            </ListItem>
                        )}
                    </List>

                    <List>
                        <ListItem
                            key="addCourse"
                        >
                            <IconButton
                                onClick={() => {
                                    let data = {
                                        courseCode: this.state.courseCode,
                                        accountID: this.props.account.accountID,
                                    }

                                    checkCourseCode(data).then((message) => {
                                        this.setState({courseCodeText: message});
                                        // TODO: Add red error when course code is invalid in some way
                                        setTimeout(() => {
                                            this.setState({courseCodeText: "Course code"});
                                        }, 3000);
                                    });
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                            <TextField
                                variant="outlined"
                                size="small"
                                label={this.state.courseCodeText}
                                onChange={(event) => {
                                    this.setState({courseCode: event.target.value});
                                }}
                            />
                        </ListItem>
                    </List>
                </Drawer>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeAccount: (data) => dispatch(changeAccount(data)),
        changeCourses: (data) => dispatch(changeCourses(data)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, { withTheme: true })(withWidth()(StudentMenu))));
