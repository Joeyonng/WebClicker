import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import moment from "moment";
import {Bar} from 'react-chartjs-2';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import {amber, cyan, blue, purple, orange, teal, lime, brown} from '@material-ui/core/colors';
import Skeleton from '@material-ui/lab/Skeleton';
import Divider from "@material-ui/core/Divider";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

import {listenPollStudents, setPollStudent} from "../firebaseApi";

const shade = 200;
const colors = [amber[shade], cyan[shade], blue[shade], purple[shade], orange[shade], teal[shade], lime[shade], brown[shade]];

const styles = theme => ({
    pollBackground: {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
    },
    bar: {
        height: 320
    },
    image: {
        height: 320,
    },
});

class StudentPoll extends Component {
    constructor(props) {
        super(props);
        //console.log("InstructorPoll Constructor", this.props);

        this.state = {
            imageUrl: null,
            students: null,
        };
    }

    componentDidMount() {
        //console.log('InstructorPoll: componentDidMount', this.props);

        let data = {
            pollID: this.props.poll.pollID,
            action: students => {
                this.setState({students: students})
            }
        };
        this.unListenPollStudents = listenPollStudents(data);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorPoll: componentDidUpdate', prevProps, this.props);

    }

    componentWillUnmount() {
        //console.log('InstructorPoll: componentWillUnmount');

        this.unListenPollStudents();
    }

    getPollData(students, categoryName, optionNames) {
        let data = {
            Total: [0, 0, 0, 0, 0],
        };

        if(categoryName !== null) {
            for (let optionName of optionNames) {
                data[optionName] = [0, 0, 0, 0, 0];
            }
            data['Unknown'] = [0, 0, 0, 0, 0]
        }

        // Fulfill datasets with poll results
        if(students !== null) {
            for(let student of Object.values(students)) {
                // Get the student's answer and categories
                let studentVote = student.studentVote;
                let studentCategories = student.studentCategories;

                // Check whether the answer is valid or not
                let studentVoteIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(studentVote);
                if(studentVoteIndex === -1) {
                    continue;
                }

                data['Total'][studentVoteIndex]++;

                if (categoryName !== null) {
                    // Get the student's option in category
                    let optionName = studentCategories[categoryName];

                    // Student's default option is 'Unknown'
                    optionName = optionName === undefined ? 'Unknown' : optionName;

                    // Increment the count of the answer in the student's option by 1
                    data[optionName][studentVoteIndex]++;
                }
            }
        }

        return data;
    };

    getGraphData(pollData) {
        let datasets = [{
            label: 'No Data',
            data: [0, 0, 0, 0, 0]
        }];

        let sum = 0;
        for(let subTotal in pollData['Total']) {
            sum += pollData['Total'][subTotal];
        }

        if(pollData !== {}) {
            // If the poll is not empty, delete the default option
            datasets.splice(0, 1);

            let restCount = Array.from(pollData['Total']);

            datasets.push({
                label: 'Rest',
                data: restCount.map((count) => Math.ceil((count / sum) * 100)),
            });
        }

        return {
            labels: ['A', 'B', 'C', 'D', 'E'],
            datasets,
        }
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';
        let student = {
            studentVote: '',
            studentCategories: Object.keys(this.props.poll.pollCategories).reduce((acc,cur) => (acc[cur] = '', acc), {}),
        };
        if (this.state.students !== null && this.state.students[this.props.account.accountID] !== undefined) {
            student['studentVote'] = this.state.students[this.props.account.accountID].studentVote;
            student['studentCategories'] = this.state.students[this.props.account.accountID].studentCategories;
        }

        let voteButtons = (fullWidth) => (
            <ButtonGroup fullWidth={fullWidth}>
                {['A', 'B', 'C', 'D', 'E'].map((choice) =>
                    <Button
                        key={choice}
                        disabled={!this.props.course.courseActivityPollLive}
                        color={student.studentVote === choice ? "primary" : "default"}
                        variant={student.studentVote=== choice ? "contained" : "outlined"}
                        onClick={() => {
                            let data = {
                                pollID: this.props.poll.pollID,
                                studentID: this.props.account.accountID,
                                vote: choice,
                                categories: student.studentCategories,
                            };

                            setPollStudent(data).then(() => {
                            }).catch(err => {
                                this.setState(err)
                            });
                        }}
                    >
                        {choice}
                    </Button>
                )}
            </ButtonGroup>
        );

        return (
            this.state.students === null ? null :
                <div>
                    <Card
                        className={this.props.classes.pollBackground}
                        elevation={0}
                    >
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar style={{borderRadius: 0}}>
                                    {this.props.index}
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                primary={moment(Number(this.props.poll.pollStartTime)).format("ddd, MMM Do YYYY, H:mm")}
                                secondary={this.state.students === null ? "" :
                                    Object.keys(this.state.students).length + ' Student Responses'
                                }
                            />
                            {mobile ? null : voteButtons(false)}
                        </ListItem>

                        {!mobile ? null : <ListItem> {voteButtons(true)} </ListItem>}

                        <ListItem>
                            <Grid
                                style={{marginTop: 8, marginBottom: 8}}
                                container
                                direction="row"
                                justify="center"
                                alignItems="center"
                                spacing={1}
                            >
                                {Object.entries(this.props.poll.pollCategories).map(([categoryName, optionNames]) =>
                                    <Grid
                                        key={categoryName}
                                        style={{marginTop: 2, marginBottom: 2}}
                                        item
                                        md={3}
                                        xs={12}
                                    >
                                        <FormControl
                                            variant="outlined"
                                            fullWidth={true}
                                            size="small"
                                            disabled={!this.props.course.courseActivityPollLive}
                                        >
                                            <InputLabel>{categoryName}</InputLabel>
                                            <Select
                                                value={student.studentCategories[categoryName]}
                                                onChange={(event) => {
                                                    student.studentCategories[categoryName] = event.target.value;

                                                    this.setState({students: Object.assign(this.state.students, {[this.props.account.accountID]: student})});
                                                }}
                                                label={categoryName}
                                            >
                                                {optionNames.map(optionName =>
                                                    <MenuItem
                                                        key={optionName}
                                                        value={optionName}
                                                    >
                                                        {optionName}
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                            </Grid>
                        </ListItem>

                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            spacing={1}
                        >
                            {!this.props.course.courseActivityPollDisplay ? null :
                                <Grid item md={6} xs={12}>
                                    {this.state.students === null ? <Skeleton variant="rect" className={this.props.classes.bar}/> :
                                        <Paper className={this.props.classes.bar} elevation={0}>
                                            <Bar
                                                data={this.getGraphData(this.getPollData(this.state.students, null, null))}
                                                redraw={true}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    animation: false,
                                                    scales: {
                                                        xAxes: [{
                                                            stacked: true,
                                                        }],
                                                        yAxes: [{
                                                            stacked: true,
                                                            suggestedMin: 0,
                                                            ticks: {
                                                                min: 0,
                                                                max: 100,
                                                                callback: value => value + "%",
                                                            },
                                                        }]
                                                    },
                                                }}
                                                legend={{display: false}}
                                            />
                                        </Paper>
                                    }
                                </Grid>
                            }

                            <Grid item md={6} xs={12}>
                                {this.state.imageUrl === null ? <Skeleton variant="rect" className={this.props.classes.image}/> :
                                    <CardMedia
                                        style={{objectFit: 'contain'}}
                                        component="img"
                                        height={mobile ? null : "320"}
                                        image={this.state.imageUrl}
                                    />
                                }
                            </Grid>
                        </Grid>
                    </Card>

                    <Divider/>
                    {/*
                <div style={{backgroundColor: this.state.vote === null ? '' : this.state.color, height: '100vh'}}>
                </div>
                */}
                </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(StudentPoll))));
