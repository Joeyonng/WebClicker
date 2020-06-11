import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import ChipInput from "material-ui-chip-input";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';

import {createCourse, fetchCourses} from "../firebaseApi";
import {changeCourses} from "../redux";
import { blue } from '@material-ui/core/colors';

const styles = theme => ({
    courseCode: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    generateButton: {
        marginLeft: '12px'
    }
});

class InstructorCourseSettings extends React.Component {
    constructor(props) {
        super(props);
        //console.log("InstructorCourseSettings props", this.props);

        this.state = {
            name: this.props.course === undefined ? '' : this.props.course.courseName,
            quarter: this.props.course === undefined ? '' : this.props.course.courseQuarter,
            courseCode: this.props.course === undefined ? "None" : (this.props.course.courseCode === undefined ? '' : this.props.course.courseCode),
            categoryNames: this.props.course === undefined ? [] : Object.keys(this.props.course.courseCategories),
            optionNames: this.props.course === undefined ? [] : Object.values(this.props.course.courseCategories),

            nameError: '',
            quarterError: '',
            courseCodeError: '',
            categoryNamesErrors: '',
            optionNamesErrors: this.props.course === undefined ? [] : Object.keys(this.props.course.courseCategories).map(() => ""),
        };
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                fullScreen={mobile}
                fullWidth
                maxWidth="sm"
                open={this.props.open}
                onClose={() => {this.props.openCtl(false)}}
            >
                <DialogTitle>
                    {this.props.newCourse ? 'Add Course' : 'Course Settings'}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Course Name"
                        value={this.state.name}
                        error={this.state.nameError.length !== 0}
                        helperText={this.state.nameError}
                        onChange={(event) => {
                            this.setState({
                                name: event.target.value,
                                nameError: '',
                            });
                        }}
                    />

                    <FormControl
                        fullWidth
                        margin="normal"
                        error={this.state.quarterError.length !== 0}
                    >
                        <InputLabel>Choose Quarter</InputLabel>
                        <Select
                            value={this.state.quarter}
                            onChange={(event) => {
                                this.setState({
                                    quarter: event.target.value,
                                    quarterError: '',
                                });
                            }}
                        >
                            {['Winter', 'Spring', 'Summer', 'Fall'].map(quarter => (
                                <MenuItem
                                    button={true}
                                    key={quarter}
                                    value={quarter}
                                >
                                    {quarter}
                                </MenuItem>
                            ))}
                        </Select>
                        {this.state.quarterError.length === 0 ? null : <FormHelperText>{this.state.quarterError}</FormHelperText>}
                    </FormControl>

                    <div className={this.props.classes.courseCode} >
                        <TextField
                            fullWidth
                            disabled
                            margin="normal"
                            label="Course code"
                            value={this.state.courseCode == '' ? "None" : this.state.courseCode}
                            error={this.state.courseCodeError.length !== 0}
                            helperText={this.state.courseCodeError}
                        />

                        <IconButton
                            className={this.props.classes.generateButton}
                            variant="outlined"
                            onClick={() => {
                                let newCode = "";
                                let characters = "ABCDFGHJKLMNOPRSTUVWXYZ"
                                for (let i = 0; i < 6; i++) {
                                    let charLocation = Math.floor(Math.random() * characters.length);
                                    newCode += characters.charAt(charLocation);
                                    characters = characters.substring(0, charLocation) + characters.substring(charLocation + 1);
                                }

                                this.setState({
                                    courseCode: newCode,
                                    courseCodeError: ''
                                })
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </div>

                    <ChipInput
                        fullWidth
                        margin="normal"
                        label="Categories"
                        placeholder=""
                        value={this.state.categoryNames}
                        onAdd={categoryName => {
                            let newCategoryNames = this.state.categoryNames;
                            let newOptionNames = this.state.optionNames;
                            let newOptionNamesErrors = this.state.optionNamesErrors;
                            newCategoryNames.push(categoryName);
                            newOptionNames.push([]);
                            newOptionNamesErrors.push("");

                            this.setState({
                                categories: newCategoryNames,
                                optionNames: newOptionNames,
                                optionsErrors: newOptionNamesErrors,
                            });
                        }}
                        onDelete={(categoryName, categoryIndex) => {
                            let newCategoryNames = this.state.categoryNames;
                            let newOptionNames = this.state.optionNames;
                            let newOptionNamesErrors = this.state.optionNamesErrors;
                            newCategoryNames.splice(categoryIndex, 1);
                            newOptionNames.splice(categoryIndex, 1);
                            newOptionNamesErrors.splice(categoryIndex, 1);

                            this.setState({
                                categories: newCategoryNames,
                                optionNames: newOptionNames,
                                optionsErrors: newOptionNamesErrors,
                            });
                        }}
                    />

                    {this.state.categoryNames.map((categoryName, categoryIndex) =>
                        <ChipInput
                            key={categoryName}
                            fullWidth
                            margin="normal"
                            label={categoryName}
                            placeholder=""
                            value={this.state.optionNames[categoryIndex]}
                            error={this.state.optionNamesErrors[categoryIndex].length !== 0}
                            helperText={this.state.optionNamesErrors[categoryIndex]}
                            onAdd={optionName => {
                                let newOptionNames = this.state.optionNames;
                                let newOptionNamesErrors = this.state.optionNamesErrors;
                                newOptionNames[categoryIndex].push(optionName);
                                newOptionNamesErrors[categoryIndex] = "";

                                this.setState({
                                    optionNames: newOptionNames,
                                    optionNamesErrors: newOptionNamesErrors,
                                });
                            }}
                            onDelete={(optionName, optionIndex) => {
                                let newOptionNames = this.state.optionNames;
                                let newOptionNamesErrors = this.state.optionNamesErrors;
                                newOptionNames[categoryIndex].splice(optionIndex, 1);
                                newOptionNamesErrors[optionIndex] = "";

                                this.setState({
                                    optionNames: newOptionNames,
                                    optionNamesErrors: newOptionNamesErrors,
                                });
                            }}
                        />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.props.openCtl(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="primary"
                        onClick={() => {
                            let error = false;

                            // The course name cannot be empty
                            if(this.state.name.length === 0) {
                                this.setState({nameError: 'The course identifier cannot be empty!'});
                                error = true;
                            }

                            // The quarter cannot be empty
                            if(this.state.quarter.length === 0) {
                                this.setState({quarterError: 'The course identifier cannot be empty!'});
                                error = true;
                            }

                            // The category options cannot be empty
                            let newOptionNamesErrors = this.state.optionNamesErrors;
                            this.state.optionNames.forEach((optionNames, optionIndex) => {
                                if (optionNames.length === 0) {
                                    newOptionNamesErrors[optionIndex] = 'The category options cannot be empty!';
                                    error = true;
                                }
                            });

                            this.setState({optionNamesErrors: newOptionNamesErrors});

                            if(!error) {
                                let courseCategories = {};
                                this.state.categoryNames.forEach((categoryName, categoryIndex) => {
                                    courseCategories[categoryName] = this.state.optionNames[categoryIndex];
                                });

                                let data = {
                                    courseName: this.state.name,
                                    courseQuarter: this.state.quarter,
                                    courseCode: this.state.courseCode,
                                    courseCategories: courseCategories,
                                    courseInstructorID: this.props.account.accountID,
                                    courseActivitySessionID: '',
                                    courseActivityPollID: '',
                                };

                                createCourse(data).then(() => {
                                    let data = {
                                        accountID: this.props.account.accountID,
                                    };

                                    fetchCourses(data).then(courses => {
                                        this.props.openCtl(false);
                                        this.props.changeCourses(courses);
                                    });
                                });
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>

            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeCourses: (data) => dispatch(changeCourses(data)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorCourseSettings))));
