(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        // get a promise object of the patient's demographic data
        var pt = patient.read();
        // fetch all conditions for the current patient that match our criteria
        // smart-Condition-393 === http://snomed.info/sct/195967001
        var conds = smart.patient.api.fetchAll({
          type: 'Condition',
          query: {
            _id: {
              $or: ['smart-Condition-393', 'smart-Condition-344', 'http://snomed.info/sct/195967001']
            }
          }
        });

        // register error callbacks on the fetches
        $.when(pt, conds).fail(onError);

        // register success callbacks on the fetches
        $.when(pt, conds).done(function(patient, conditions) {
          console.log(patient)
          console.log(conditions)
          var medicationsInfo = window.medicationsInfo;

          var demoData = getDemoData(patient);
          var asthmaConditions = getAsthmaConditions(conditions);
          var recs = [];
          var age = demoData.age;
          if (asthmaConditions.length > 0) {
            console.log(medicationsInfo)
            for (var i = 0; i < medicationsInfo.length; i++) {
              var current = medicationsInfo[i];
              console.log(age, current)
              if (age >= current.ageMin && age <= current.ageMax) {
                recs.push(current);
                console.log(true, current)
              }
            }
          } else {
            recs = 'none';
          }

          var response = {
            patient: demoData,
            recommendations: recs
          };

          ret.resolve(response);
        });
      } else {
        onError();
      }
    }

    function getDemoData(patient) {
      // get basic data from the patient
      var gender = patient.gender;
      var fname = '';
      var lname = '';

      // merge together multiple first names into one field
      if (typeof patient.name[0] !== 'undefined') {
        fname = patient.name[0].given.join(' ');
        lname = patient.name[0].family.join(' ');
      }

      var birthdate = patient.birthDate;
      var ageInYears = moment().diff(birthdate, 'years');
      var ageInDays = moment().diff(birthdate, 'days');

      var demoData = {
        fname: fname,
        lname: lname,
        gender: gender,
        birthdate: birthdate,
        age: ageInDays / 365
      };

      return demoData;
    }

    function getAsthmaConditions(conditions) {
      var asthmaConditionsCodes = ['smart-Condition-393', 'smart-Condition-344'];
      var patientAsthmaCodes = []
      for (var i = 0; i < conditions.length; i++) {
        console.log(conditions[i])
        var current = conditions[i]
        for (var j = 0; j < asthmaConditionsCodes.length; j++) {
          if (current.id === asthmaConditionsCodes[j]) {
            patientAsthmaCodes.push(asthmaConditionsCodes[j]);
          }
        }
      }
      console.log(patientAsthmaCodes)
      return patientAsthmaCodes;
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  window.displayPatientData = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
  };

  window.displayReccomendations = function(r) {
    console.log(r)
  };

})(window);
