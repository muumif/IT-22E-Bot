export type BodyMail = {
      title: string,
      message: string,
      "created-at": string,
      "from-name": string,
      "from-mail": string,
      "web-link": string;
}

type studentGroups = {
      id: number,
      code: string
}

type timetableEvent = {
      id: number,
      journalId: number,
      subjectStudyPeriodId: null,
      nameEt: string,
      nameEn: string,
      date: Date,
      timeStart: string,
      timeEnd: string,
      hasStarted: boolean,
      teachers: [
            {
                  id: number,
                  name: string
            }
      ],
      rooms: [
            {
                  id: number,
                  roomCode: string,
                  buildingCode: "A" | "B"
            }
      ] | [],
      studentGroups: [
            studentGroups
      ],
      subgroups: [],
      students: [],
      addInfo: null,
      singleEvent: boolean,
      publicEvent: boolean,
      timetableId: number,
      showStudyMaterials: boolean,
      capacityType: string,
      isPersonal: null,
      person: null,
      isJuhanEvent: boolean,
      isExam: boolean,
      isOngoing: null,
      includesEventStudents: boolean,
      changed: Date,
      canEdit: null,
      canDelete: null,
      nameRu: string
}

export interface TahvelTunniplaan {
	studyPeriods: "Sügissemester" | "Kevadsemester",
	timetableEvents: [
            timetableEvent,
	],
	school: {
		id: number,
		nameEt: string,
		nameEn: string,
		nameRu: string
	},
	isHigher: false,
	personalParam: null,
	generalTimetableCurriculum: {
		studentGroupCode: string,
		curriculumCode: string,
		nameEt: string,
		nameEn: string
	}
}