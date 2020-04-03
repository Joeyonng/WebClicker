import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import moment from "moment";
import {Bar} from 'react-chartjs-2';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {amber, cyan, blue, purple, orange, teal, lime, brown} from '@material-ui/core/colors';
import Skeleton from '@material-ui/lab/Skeleton';

import Divider from "@material-ui/core/Divider";
import {listenPollStudents} from "../firebaseApi";

const shade = 200;
const colors = [amber[shade], cyan[shade], blue[shade], purple[shade], orange[shade], teal[shade], lime[shade], brown[shade]];

const styles = theme => ({
    card: {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
    },
    bar: {
        height: 320
    },
    image: {
        height: 320,
    },

    listItem0: { backgroundColor: colors[0] + '!important', },
    listItem1: { backgroundColor: colors[1] + '!important', },
    listItem2: { backgroundColor: colors[2] + '!important', },
    listItem3: { backgroundColor: colors[3] + '!important', },
    listItem4: { backgroundColor: colors[4] + '!important', },
    listItem5: { backgroundColor: colors[5] + '!important', },
    listItem6: { backgroundColor: colors[6] + '!important', },
    listItem7: { backgroundColor: colors[7] + '!important', },
});

class InstructorPoll extends Component {
    constructor(props) {
        super(props);
        //console.log("InstructorPoll Constructor", this.props);

        this.state = {
            students: null,
            imageUrl: null,
            categoryAnchorEl: null,
            categoryName: null,
            optionsConfig: [],
        };
    }

    componentDidMount() {
        //console.log('InstructorPoll: componentDidMount', this.props);

        let data = {
            pollID: this.props.poll.pollID,
            action: (students) => {
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
                    optionName = optionName === undefined || optionName === '' ? 'Unknown' : optionName;

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
            for(let optionConfig of this.state.optionsConfig) {
                if(optionConfig.checked) {
                    datasets.push({
                        label: optionConfig.optionName,
                        data: pollData[optionConfig.optionName].map((count) => Math.ceil((count / sum) * 100)),
                        backgroundColor: colors[optionConfig.index],
                    });

                    // Count the number of rest polls
                    for(let index in restCount) {
                        restCount[index] = restCount[index] - pollData[optionConfig.optionName][index];
                    }
                }
            }

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

        return (
            <div>
                <Card className={mobile ? null : this.props.classes.card} elevation={0}>
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
                        {mobile ? null :
                            <Button
                                variant="outlined"
                                onClick={(event) => {
                                    this.setState({categoryAnchorEl: event.currentTarget})
                                }}
                            >
                                {this.state.categoryName === null ? 'Category' : this.state.categoryName}
                            </Button>
                        }
                    </ListItem>

                    {!mobile ? null :
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={(event) => {
                                this.setState({categoryAnchorEl: event.currentTarget})
                            }}
                        >
                            {this.state.categoryName === null ? 'Category' : this.state.categoryName}
                        </Button>
                    }

                    <Grid
                        style={{marginTop: 8, marginBottom: 8}}
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={0}
                    >

                        {this.state.optionsConfig.map((option, index) => {
                            let listItemStyle = 'listItem' + option.index;
                            return (
                                <Grid item key={index}><List style={{padding: 0}}>
                                    <ListItem
                                        classes={{selected: this.props.classes[listItemStyle]}}
                                        dense
                                        button
                                        selected={option.checked}
                                        onClick={() => {
                                            let newOptionsConfig = this.state.optionsConfig;
                                            for(let newIndex in newOptionsConfig) {
                                                newOptionsConfig[Number(newIndex)].checked = (Number(newIndex) === index);
                                            }
                                            this.setState({optionsConfig: newOptionsConfig})
                                        }}
                                    >
                                        <ListItemText primary={option.optionName} />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                style={{padding: 8}}
                                                edge="end"
                                                onClick={() => {
                                                    let newOptionsConfig = this.state.optionsConfig;
                                                    newOptionsConfig[index].checked = !newOptionsConfig[index].checked;
                                                    this.setState({optionsConfig: newOptionsConfig});
                                                }}
                                            >
                                                {option.checked ? <RemoveIcon/> : <AddIcon/>}
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List> </Grid>
                            )
                        })}
                    </Grid>

                    <Grid
                        container
                        spacing={1}
                    >
                        <Grid item md={6} xs={12}>
                            {this.state.students === null ? <Skeleton variant="rect" className={this.props.classes.bar}/> :
                                <Paper className={this.props.classes.bar} elevation={0}>
                                    <Bar
                                        data={this.getGraphData(this.getPollData(this.state.students,
                                            this.state.categoryName, this.props.course.courseCategories[this.state.categoryName]))}
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

                {this.props.course === undefined ? null : this.props.course.name === 'unknown' ? null :
                    <Menu
                        id="category-menu"
                        anchorEl={this.state.categoryAnchorEl}
                        open={Boolean(this.state.categoryAnchorEl)}
                        onClose={() => {this.setState({categoryAnchorEl: null})}}
                    >
                        {Object.keys(this.props.course.courseCategories).map(categoryName => (
                            <MenuItem
                                button={true}
                                key={categoryName}
                                onClick={()=>{
                                    let optionNames = this.props.course.courseCategories[categoryName];

                                    let newOptionsConfig = [];
                                    optionNames.concat(['Unknown']).forEach((optionName, index) => {
                                        newOptionsConfig.push({
                                            optionName: optionName,
                                            checked: true,
                                            index: index,
                                        });
                                    });

                                    this.setState({
                                        categoryAnchorEl: null,
                                        categoryName: categoryName,
                                        optionsConfig: newOptionsConfig,
                                    });
                                }}
                            >
                                {categoryName}
                            </MenuItem>
                        ))}
                    </Menu>
                }

                <Divider/>
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
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorPoll))));
