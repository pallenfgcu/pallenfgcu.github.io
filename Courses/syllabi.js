export const load=(term, crn)=>{
    fetch("./courses.json")
        .then((res) => res.json())
        .then((data) => {
            if (term && crn) {
                loadSectionInfo(data, term, crn);
                loadContactInfo(data);
            }
            else {
                hideSectionInfo();
                hideContactInfo();
            }
        });

    loadGradScale();
}

export const buildCourseCards = (data, containerSelector = ".course-grid") => {
    const container = document.querySelector(containerSelector);
    if (!container || !data.courses) return;

    container.innerHTML = data.courses.map(courseEntry => buildCourseCard(courseEntry)).join("");
}

function buildCourseCard(courseEntry) {
    // Course code is the key that isn't a sibling "description"/"prerequisites" field
    // (a couple of entries in courses.json are malformed and store those as siblings
    // of the code instead of nested under it).
    const code = Object.keys(courseEntry).find(k => k !== "description" && k !== "prerequisites");
    const value = courseEntry[code];

    const title = (typeof value === "object") ? value.title : value;
    const description = (typeof value === "object") ? value.description : courseEntry.description;
    const prerequisites = (typeof value === "object") ? value.prerequisites : courseEntry.prerequisites;
    const creditHours = (typeof value === "object") ? value.credit_hours : courseEntry.credit_hours;

    const crse = code.replace(" ", "").toLowerCase();
    const creditLabel = (creditHours !== undefined)
        ? `${parseFloat(creditHours)} credit(s)`
        : "";

    const prereqSection = prerequisites
        ? `
        <hr class="course-card__rule" />

        <div class="course-card__footer">
            <h4>Prerequisite(s)</h4>
            <p>${prerequisites}</p>
        </div>`
        : "";

    return `
    <article class="course-card">
        <div class="course-card__body">
            <h3 class="course-card__title">
                <a href="Courses/${crse}_syllabus.html">
                    ${code} ${title}${creditLabel ? ` - ${creditLabel}` : ""}
                </a>
            </h3>

            <h4>Sections:</h4>
            <details class="course-sections">
                <summary class="course-sections__summary">
                    View sections
                </summary>
                <ul id="section_list_${crse}"></ul>
            </details>

            <h4>Description</h4>
            <p>
                ${description || ""}
            </p>
        </div>
        ${prereqSection}
    </article>`;
}

export const loadSectList=() => {
    fetch("./Courses/courses.json")
        .then((res) => res.json())
        .then((data) => {
            loadSectionLists(data);
        });
}

function loadSectionLists(data) {

    for (let t=0; t < data.sections.length; ++t) {

        Object.keys(data.sections[t]).forEach(term => {

            const sectionInfo = data.sections.find( terms => term in terms);

            for (let c=0; c < sectionInfo[term].courses.length; ++c) {

                Object.keys(sectionInfo[term].courses[c]).forEach(crn => {

                    const courseInfo = sectionInfo[term].courses.find(crns => crn in crns);

                    const crse = courseInfo[crn].course.replace(" ", "").toLowerCase();
                    const sectList = $(`#section_list_${crse}`);
                    if (sectList) {
                        const listItem =  $('<li>');
                        const listLink = $('<a>', {href: `Courses/${crse}_syllabus.html?term=${term}&crn=${crn}`});
                        listLink.append(`${courseInfo[crn].course} ${parseTerm(term)} CRN: ${crn}`);
                        listItem.append(listLink);
                        sectList.append(listItem);
                    }

                });

            }

        }); // each term

    }

} // loadSectionLists

async function loadGradScale() {
    const table = document.getElementById("grade_scale");
    if (!table) return;

    try {
        const response = await fetch("grade_scale.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const rows = data.grades
            .map(({ grade, gpa, range }) => `<tr><td>${grade}</td><td>${gpa}</td><td>${range}</td></tr>`)
            .join("");

        table.innerHTML = `<thead><tr><th>GRADE</th><th>GPA</th><th>RANGE</th></tr></thead><tbody>${rows}</tbody>`;
    } catch (err) {
        console.error("Failed to load grade scale:", err);
    }
}



function parseTerm(term) {
    let ret = '';
    const mnth = term.substring(4,6);
    switch(mnth) {
        case '01':
            ret += 'Spring';
            break;
        case '05':
            ret += 'Summer';
            break;
        case '08':
            ret += 'Fall';
            break;
    }

    ret += ' ' + term.substring(0, 4);

    return ret;
}

function loadContactInfo(data) {
    const divInfo = $('#contact_info');
    const divTitle = $(`<h1 class="w3-medium w3-text-teal w3-left-align">Instructor Information</h1>`);
    divInfo.append(divTitle);
    const divTab = $('<table>', {class: 'w3-small syllabi_info'});
    divTab.append(tableInfoRow('Instructor:', data.name));
    divTab.append(tableInfoRow('Title:', data.title));
    divTab.append(tableInfoRow('Office:', data.office));
    divTab.append(tableInfoRow('Phone:', data.phone));
    const commMethod = ' <strong>(All communication via Canvas message)</strong>';
    divTab.append(tableInfoRow('Email:', data.email + commMethod));
    divInfo.append(divTab);
} // loadContactInfo


function loadSectionInfo(data, term, crn) {
    const sectionInfo = data.sections.find( terms => term in terms);
    const courseInfo = sectionInfo[term].courses.find(courses => crn in courses);
    const divInfo = $('#section_info');

    const divTitle = $(`<h1 class="w3-medium w3-text-teal w3-left-align">Course Information</h1>`);
    divInfo.append(divTitle);
    const divTab = $('<table>', {class: 'w3-small syllabi_info'});
    divTab.append(tableInfoRow('Term:', term));
    divTab.append(tableInfoRow('CRN:', crn));
    const course = courseInfo[crn].course;
    const theCourse = data.courses.find(courses => course in courses);
    const courseTitle = theCourse[course].title;
    $('#header_course_title').html(`${course} ${courseTitle}`);
    divTab.append(tableInfoRow('Course:', `${course} ${courseTitle}`));
    divTab.append(tableInfoRow('Class:', courseInfo[crn].room));
    divTab.append(tableInfoRow('Days/Times:', courseInfo[crn].days + ' / ' + courseInfo[crn].times));
    divInfo.append(divTab);

    const divOfficeHrs = $(`<h2 class="w3-medium w3-text-teal w3-left-align">Office Hours</h2>`);
    divInfo.append(divOfficeHrs);
    const divOfficeHrsTab = $('<table>', {class: 'w3-small syllabi_info'});
    $.each(sectionInfo[term].office_hours, function(index, value) {
        divOfficeHrsTab.append(tableInfoRow('Days/Times:', `${value.days} / ${value.hours}`));
    });
    divInfo.append(divOfficeHrsTab);
    const officeHrsOther = 'Officer hours can be arranged in-person or remote outside of stated times by sending ' +
        'a message with 2-3 days/times your are available at least 24hrs in advance.  I will confirm the best time ' +
        'with you or suggest other times if need be.  You must reply to my confirmation message to ensure there is an ' +
        'agreed upon time.';
    const pOfficerHrsOther = $('<p>', {class: 'w3-small w3-left-align syllabi_info'});
    pOfficerHrsOther.append(officeHrsOther);
    divInfo.append(pOfficerHrsOther);
}

function hideContactInfo() {
    const divInfo = $('#contact_info');
    divInfo.hide();
}


function hideSectionInfo() {
    const divInfo = $('#section_info');
    divInfo.hide();
}

function tableInfoRow(label, item) {
    const row = $('<tr>');
    const rowHeader = $('<th>, {class: \'syllabi_info\'}');
    rowHeader.append(label) ;
    const rowData = $('<td>, {class: \'syllabi_info\'}');
    rowData.append(item);
    row.append(rowHeader);
    row.append(rowData);
    return row;
}