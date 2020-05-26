import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import XLSX from 'xlsx';
import MaterialTable from 'material-table';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DoneOutlinedIcon from '@material-ui/icons/DoneOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import NavigateNextOutlinedIcon from '@material-ui/icons/NavigateNextOutlined';
import NavigateBeforeOutlinedIcon from '@material-ui/icons/NavigateBeforeOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';

import {fetchCourseStudents, setCourseStudents} from "../firebaseApi";

const styles = theme => ({
});

class InstructorCourseEnrollment extends Component {
    constructor(props) {
        super(props);
        //console.log("InstructorCourseEnrollment props", this.props);

        this.state = {
            studentsData: null,
        };

        this.studentFileRef = React.createRef();
    }

    componentDidMount() {
        //console.log('InstructorCourseEnrollment: componentDidMount', this.props);

        if (this.props.course !== undefined) {
            let data = {
                courseID: this.props.course.courseID,
            };

            fetchCourseStudents(data).then(students => {
                let studentsData = this.convertStudentsToTable(students, this.props.course.courseCategories);
                this.setState({studentsData: studentsData});
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorCourseEnrollment: componentDidUpdate', prevProps, this.props);

        if (this.props.course !== prevProps.course) {
            if (this.props.course !== undefined) {
                let data = {
                    courseID: this.props.course.courseID,
                };

                fetchCourseStudents(data).then(students => {
                    let studentsData = this.convertStudentsToTable(students, this.props.course.courseCategories);
                    this.setState({studentsData: studentsData});
                });
            }
        }
    }

    convertStudentsToTable(students, courseCategories) {
        let studentsData = [];
        for(let student of Object.values(students)) {
            let studentData = {};
            studentData['studentID'] = student.studentID;

            for(let category in student.studentCategories) {
                studentData[category] = courseCategories[category].indexOf(student.studentCategories[category]);
            }
            studentsData.push(studentData);
        }
        return studentsData
    }

    convertTableToStudents(studentsData, courseCategories) {
        let students = {};
        for(let studentData of studentsData) {
            let student = {studentCategories: {}};
            for(let columnName in studentData) {
                if(columnName === 'studentID') {
                    student[columnName] = studentData[columnName]
                }
                else if (columnName !== 'tableData') {
                    let optionName = courseCategories[columnName][studentData[columnName]];
                    if(optionName !== undefined) {
                        student['studentCategories'][columnName] = optionName
                    }
                }
            }

            students[studentData['studentID']] = student;
        }

        return students
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                fullScreen={mobile}
                fullWidth
                maxWidth="xl"
                open={this.props.open}
                onClose={() => {this.props.openCtl(false)}}
            >
                <DialogTitle>
                    {this.props.course.courseName + ' Students'}
                </DialogTitle>

                <DialogContent>
                    <MaterialTable
                        title="Students"
                        columns={[{title: 'Student ID', field: 'studentID'}].concat(
                            Object.keys(this.props.course.courseCategories).map((category) => {
                                return {
                                    title: category,
                                    field: category,
                                    emptyValue: 'Unknown',
                                    lookup: Object.assign({'-1': 'Unknown'}, this.props.course.courseCategories[category]),
                                }
                            })
                        )}
                        data={this.state.studentsData === null ? [] : this.state.studentsData}
                        icons={{
                            Add: AddOutlinedIcon,
                            Delete: DeleteOutlinedIcon,
                            Edit: EditOutlinedIcon,
                            Check: DoneOutlinedIcon,
                            Clear: ClearOutlinedIcon,
                            Search: SearchOutlinedIcon,
                            NextPage: NavigateNextOutlinedIcon,
                            PreviousPage: NavigateBeforeOutlinedIcon,
                            ResetSearch: ClearOutlinedIcon,
                        }}
                        components={{Container: (props) => <Paper {...props} elevation={0}/>}}
                        options={{
                            showFirstLastPageButtons: false,
                        }}
                        actions={[
                            {
                                icon: AttachFileOutlinedIcon,
                                tooltip: 'Upload Excel File',
                                isFreeAction: true,
                                onClick: () => {
                                    this.studentFileRef.current.click()
                                }
                            },
                            {
                                icon: GetAppOutlinedIcon,
                                tooltip: 'Download Excel File',
                                isFreeAction: true,
                                onClick: () => {
                                    let wb = XLSX.utils.book_new();

                                    let studentSheet = [['Student ID'].concat(Object.keys(this.props.course.courseCategories))];
                                    for (let student of this.state.studentsData) {
                                        let row = [];
                                        for (let field of studentSheet[0]) {
                                            row.push(student[field]);
                                        }
                                        studentSheet.push(row);
                                    }
                                    let ws1 = XLSX.utils.json_to_sheet(studentSheet, {skipHeader: true});
                                    XLSX.utils.book_append_sheet(wb, ws1, 'Student Sheet');

                                    let instructionSheet = [
                                        ['Instructions: '],
                                        ['1. Only enter the number of each subcategory.'],
                                        ['2. The number can only be -1, 0, 1, 2, 3, 4.'],
                                        ['3. All other characters will be considered as Unknown subcategory.'],
                                        ['4. Only the changes in the Student Sheet will be read when uploaded to the website.'],
                                        [''],
                                        ['Category', '-1', '0', '1', '2', '3', '4'],
                                    ];
                                    for (let category in this.props.course.courseCategories) {
                                        let row = [];
                                        row.push(category);
                                        row.push('Unknown');
                                        for (let subcategory of this.props.course.courseCategories[category]) {
                                            row.push(subcategory);
                                        }
                                        instructionSheet.push(row);
                                    }
                                    let ws2 = XLSX.utils.json_to_sheet(instructionSheet, {skipHeader: true});
                                    XLSX.utils.book_append_sheet(wb, ws2, 'Instruction Sheet');

                                    XLSX.writeFile(wb, this.props.course.courseName + ' students.xlsx')
                                }
                            }
                        ]}
                        editable={{
                            onRowAdd: newData => new Promise(resolve => {
                                if (Object.keys(newData).length - 1 !== Object.keys(this.props.course.courseCategories).length) {
                                    resolve();
                                    return;
                                }

                                let newStudentsData = this.state.studentsData;
                                newStudentsData.push(newData);
                                this.setState({studentsData: newStudentsData});

                                resolve();
                            }),
                            onRowUpdate: (newData, oldData) => new Promise(resolve => {
                                if (Object.keys(newData).length - 1 !== Object.keys(this.props.course.courseCategories).length) {
                                    resolve();
                                    return;
                                }

                                let data = this.state.studentsData;
                                data[data.indexOf(oldData)] = newData;
                                this.setState({studentsData: data});

                                resolve();
                            }),
                            onRowDelete: oldData => new Promise(resolve => {
                                let data = this.state.studentsData;
                                data.splice(data.indexOf(oldData), 1);
                                this.setState({studentsData: data});

                                resolve();
                            })
                        }}
                    />

                    <input
                        hidden={true}
                        ref={this.studentFileRef}
                        className="FileInput"
                        type="file"
                        accept=".xlsx"
                        onChange={(event) => {
                            if (event.target.files.length !== 0) {
                                let file = event.target.files[0];

                                const reader = new FileReader();
                                const rABS = !!reader.readAsBinaryString;

                                // Define how to extract the students from the excel file
                                reader.onload = (event) => {
                                    // Parse data
                                    let wb = XLSX.read(event.target.result, {type: rABS ? 'binary' : 'array'});

                                    // Get student worksheet
                                    let studentSheet = wb.Sheets[wb.SheetNames[0]];
                                    // Convert student worksheet to json
                                    let studentJson = XLSX.utils.sheet_to_json(studentSheet);

                                    // Convert student json to table format
                                    let studentsData = [];
                                    let students = {};
                                    for (let row of studentJson) {
                                        let data = {};

                                        let student_id = String(row['Student ID']);
                                        data['Student ID'] = student_id;
                                        students[student_id] = {};

                                        const valid_char = ['0', '1', '2', '3', '4', 'A', 'B', 'C', 'D', 'E'];
                                        for (let field in row) {
                                            if (field !== 'Student ID') {
                                                let answerIndex = valid_char.indexOf(String(row[field]));
                                                answerIndex = answerIndex >= 5 ? answerIndex - 5 : answerIndex;

                                                data[field] = answerIndex;
                                                students[student_id][field] = answerIndex;
                                            }
                                        }

                                        studentsData.push(data)
                                    }

                                    this.setState({studentsData: studentsData});
                                };

                                if (rABS) {
                                    reader.readAsBinaryString(file);
                                } else {
                                    reader.readAsArrayBuffer(file);
                                }
                            }
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Typography color='error'>{this.state.errorMessage}</Typography>

                    <Button
                        color="primary"
                        onClick={() => {
                            let students = this.convertTableToStudents(this.state.studentsData, this.props.course.courseCategories);

                            let data = {
                                courseID: this.props.course.courseID,
                                students: students,
                            };
                            setCourseStudents(data);

                            this.props.openCtl(false)
                        }}
                    >
                        OK
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
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorCourseEnrollment))));
