import * as Papa from 'papaparse'
import { 
  RawFileParse, } from '../shared/file-types'
import { LetterGrade } from './file-interfaces'
import {
  getHours,
  getMinutes} from 'date-fns'

export const getOnTrackScore = (GPA: number, attendancePCT: number): number =>{
    const scores = [[1,1,2,2,3], [1,2,2,3,3], [2,2,3,3,4], [2,3,4,5,5], [2,3,4,5,5]];
    if(attendancePCT>=98){return scores[Math.floor(GPA)][4];}
    if(attendancePCT>=95){return scores[Math.floor(GPA)][3];}
    if(attendancePCT>=90){return scores[Math.floor(GPA)][2];}
    if(attendancePCT>=80){return scores[Math.floor(GPA)][1];}
    return scores[Math.floor(GPA)][0];
  }
  
export const getCPSOnTrack = (math: number, reading: number, attendancePCT: number): boolean => {
  return (math >= 70 && reading >= 70 && attendancePCT >= 95);
}

export const stringToDate = (s: string): Date => {
  const d = s.split('/').map(a => parseInt(a))
  return new Date(d[2], d[0]-1, d[1])
}

export const punchcardStringToDate = (s: string): Date => {
  const d = s.split(' ')
  if(d.length === 1){
    const date = d[0].split('-').map(a=> parseInt(a))
    return new Date(date[2], date[0]-1, date[1])
  } else if(d.length === 3){
    const date = d[0].split('-').map(a=> parseInt(a))
    const timeOffset:number = d[2] === 'AM' ? 0:12;
    const time = d[1].split(':').map(a=>parseInt(a, 10))
    const newDate = new Date(date[2], date[0]-1, date[1], time[0]+timeOffset, time[1])
    if (isNaN(newDate.getTime())) {  
      console.log('Invalid date:' + newDate + ' from string' + s)
    }
    return newDate
  }
  throw new Error('Date string ' + s + ' is malformed')
}

export const fileListHas = (files: RawFileParse[], file: RawFileParse): boolean => {
  return files.some(f => f.fileName === file.fileName && f.fileType === file.fileType);
}

//both sets and check for unique file logic, only has to be internally consistent
export const getUniqueFileName = (fileName: string, files: RawFileParse[]): string => {
  const prefFiles = files.filter( f => f.fileName.startsWith(fileName))
  const posts = prefFiles.map( f => {return f.fileName.slice(fileName.length + 1)})
  /*
   * grabs the ones that have a numeric postfix in the style this uses
   * checks for the lowest unoccupied number and uses that for the name
   */
  const prevNames = posts
                  .filter( s => s.indexOf('(') === 0 && s.lastIndexOf(')') === s.length - 1)
                  .map( s => {return s.slice(1, s.length-1)})
                  .filter( s => /^\d+$/.test(s))
                  .map( s => parseInt(s, 10))
                  .sort((a, b) => a-b);
  //space before open parens is important for matching
  for (var i = 0; i<prevNames.length;i++){
    if(prevNames[i] !== i+1){
      return fileName + ' (' + i + ')'
    }
  }
  return fileName + ' (' + (prevNames.length + 1) + ')'
}

//converts a letter grade to GPA representation, A -> 4, B -> 3, etc
export const letterGradeToNorm = (g: string):number => {
  if(g==='A'||g==='a'){
    return 4;
  }
  if(g==='B'||g==='b'){
    return 3;
  }
  if(g==='C'||g==='c'){
    return 2;
  }
  if(g==='D'||g==='d'){
    return 1;
  }
  if(g==='F'||g==='f'){
    return 0;
  }
  console.log('Invalid Letter Grade')
  return -1;
}

export const normToLetterGrade = (g: number):LetterGrade => {
  if(g >= 4){
    return 'A';
  }
  if(g >= 3){
    return 'B';
  }
  if(g >= 2){
    return 'C';
  }
  if(g >= 1){
    return 'D';
  }
  if(g >= 0){
    return 'F';
  }
  console.log('Invalid Norm Grade')
  return 'f';
  
}

export const parseGrade = (g: string): number => {
  const numberGrade = parseInt(g);
  if(numberGrade || numberGrade === 0){
    return numberGrade
  }
  if(g==='A'||g==='a'){
    return 95;
  }
  if(g==='B'||g==='b'){
    return 85;
  }
  if(g==='C'||g==='c'){
    return 75;
  }
  if(g==='D'||g==='d'){
    return 65;
  }
  if(g==='F'||g==='f'){
    return 59;
  }
  if(g==='Msg'){
    return 0;
  }
  console.log('Invalid Grade ' + g)
  return -1;
}

export const isTardy = (start: number, end: number, clockIn: Date, clockOut: Date | null) : boolean[] => {
  const timeIn:number = (getHours(clockIn) * 100 + getMinutes(clockIn)) 
  const timeOut:number | null = clockOut ? (getHours(clockOut) * 100 + getMinutes(clockOut)):null
  return [timeIn > start, timeOut !== null && timeOut < end]
}