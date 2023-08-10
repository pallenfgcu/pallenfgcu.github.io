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
