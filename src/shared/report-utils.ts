import {
    ReportCards,
    ReportTitle, } from './report-types'
import {
    FileList,
    FileTypes, } from '../shared/file-types'


export const getMakeableReports = (files: FileList): ReportTitle[] => {
    return ReportCards.filter(card => {
        return card.files.every(file => files[file.fileDesc].length > 0)
    })
}