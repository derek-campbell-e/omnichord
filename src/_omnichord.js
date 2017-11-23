module.exports = function Omnichord(Midiboard){
  let oc = {};

  oc.mb = require('./midiboard')(oc);

  oc.meta = {};
  oc.meta.currentChord = {};
  oc.meta.currentChord.scale = null;
  oc.meta.currentChord.note = null;
  oc.meta.currentChord.buttonInt = null;

  oc.meta.colors = {};
  oc.meta.colors.major = {on: 2, off: 1};
  oc.meta.colors.minor = {on: 6, off: 5};
  oc.meta.colors.seventh = {on: 4, off: 3};
  oc.meta.colors.strum = {on: 5, off: 5};

  oc.mapping = require('./mapping');
  oc.notes = require('./notes');
  oc.mods = require('./mods');

  oc.currentlyPlayingNotes = [];

  oc.mapInputToKey = function(x, midiMsg) {
    let midiMessageType = midiMsg[0];

    switch (midiMessageType) {
      case 176:
        return; // sliders
      break;
    }


    let buttonInt = midiMsg[1];

    let whichRow = null;
    let whichNote = null;
    let rows = ['major', 'minor', 'seventh', 'strum'];

    for(let row in rows){
      row = rows[row];
      for(let note in oc.mapping[row]) {
        let midiNoteInt = oc.mapping[row][note];
        if (midiNoteInt === buttonInt) {
          whichRow = row;
          whichNote = note;
          break;
        }
      }
    }

    if(whichRow !== null && whichNote !== note && whichRow !== 'strum') {
      oc.clearLastChord();
      oc.selectChord(whichRow, whichNote, buttonInt);
      return;
    }

    if(whichRow === 'strum') {
      if (oc.meta.currentChord.note !== null) {
        oc.strum(midiMessageType, whichNote);
      }
      return;
    }

    if(whichRow === null || whichNote === null) {
      oc.clearLastChord();
      return;
    }

  };

  oc.selectChord = function(whichScale, whichNote, buttonInt){
    oc.meta.currentChord.scheme = whichScale;
    oc.meta.currentChord.note = whichNote;
    oc.meta.currentChord.buttonInt = buttonInt;
  };

  oc.clearLastChord = function(){
    oc.clearPlayingNotes();
    if (oc.meta.currentChord.scheme !== null) {
      if(oc.meta.currentChord.note !== null) {
        if(oc.meta.currentChord.buttonInt !== null) {
          oc.mb.outgoing(144, oc.meta.currentChord.buttonInt, oc.meta.colors[oc.meta.currentChord.scheme].off);
        }
      }
    }
  };

  oc.clearPlayingNotes = function(){
    for(let note in oc.currentlyPlayingNotes) {
      note = oc.currentlyPlayingNotes[note];
      oc.playMidiNote(128, note);
    }
  };

  oc.clearNote = function(noteInt) {
    for(let note in oc.currentlyPlayingNotes) {
      let index = note;
      note = oc.currentlyPlayingNotes[note];
      if(note === noteInt) {
        oc.currentlyPlayingNotes.splice(index, 1);
        break;
      }
    }
  };

  oc.strum = function(OnOrOffInt, whichKey){
    var whichNote = whichKey % 8;
    var whichOctave = Math.floor(whichKey /8);
    var note = oc.notes[oc.meta.currentChord.note];
    var moddedNote = note + oc.mods[oc.meta.currentChord.scheme][whichNote];
    oc.playMidiNote(OnOrOffInt, moddedNote);
  };

  oc.playMidiNote = function(OnOrOffInt, noteInt) {
    switch(OnOrOffInt) {
      case 144:
        oc.currentlyPlayingNotes.push(noteInt);
      break;
      default:
        oc.clearNote(noteInt);
      break;
    }
    oc.mb.dawOut(OnOrOffInt, noteInt, 100);
  };

  oc.bind = function(){
    oc.mb.input.on('message', oc.mapInputToKey);
  };

  oc.setupChords = function(row){
    for(var key in oc.mapping[row]) {
      var button = oc.mapping[row][key];
      oc.mb.outgoing(144, button, oc.meta.colors[row].off);
    }
  };

  oc.resetBoard = function(){
    var chordRows = ['major', 'minor', 'seventh', 'strum'];
    for(var row in chordRows){
      row = chordRows[row];
      oc.setupChords(row);
    }
  };

  oc.init = function(){
    oc.resetBoard();
    oc.bind();
    return oc;
  };

  return oc.init();

};
