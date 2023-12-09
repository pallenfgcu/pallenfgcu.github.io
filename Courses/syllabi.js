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
