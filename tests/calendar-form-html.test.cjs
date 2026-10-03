const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const { loadTs } = require('./support/load-ts.cjs');
const { installReactRuntime, mount } = require('./support/server-view.cjs');

installReactRuntime();
const React = require('react');
const { CreateEventModal, EventDetailsModal } = loadTs('app/calendar/_components/validated-event-modals');

const initialValues = {
  date: '16-09-2026',
  endDate: '17-09-2026',
  startTime: '09:00',
  endTime: '10:00',
  recurrence: { frequency: 'none' },
};

let view;
afterEach(() => {
  view?.unmount();
  view = undefined;
});

function wrapper() {
  return view.hostElements((props, _text, tag) => tag === 'div' && props.className === 'calendar-validated-modal')[0];
}

function fakeForm(fields) {
  return {
    querySelector(selector) {
      const id = selector.slice(1);
      return Object.hasOwn(fields, id) ? { value: fields[id] } : null;
    },
  };
}

async function submit(fields) {
  const event = {
    target: fakeForm(fields),
    stopped: false,
    prevented: false,
    preventDefault() { this.prevented = true; },
    stopPropagation() { this.stopped = true; },
  };
  const form = view.hostElements((_props, _text, tag) => tag === 'form' && _props.onSubmit)[0];
  await view.act(() => {
    wrapper().props.onSubmitCapture(event);
    if (!event.stopped) form.props.onSubmit(event);
  });
  return event;
}

test('invalid create chronology stays in the modal with an accessible error', async () => {
  const created = [];
  view = mount(React.createElement(CreateEventModal, {
    isOpen: true,
    initialValues,
    onCancel() {},
    onCreate: (value) => created.push(value),
  }));

  const event = await submit({
    'event-date': '16-09-2026',
    'event-end-date': '15-09-2026',
    'event-start-time': '09:00',
    'event-end-time': '10:00',
    'event-recurrence': 'none',
  });

  assert.equal(event.stopped, true);
  assert.equal(event.prevented, true);
  assert.deepEqual(created, []);
  assert.match(view.html, /role="alert"/);
  assert.match(view.text(), /La date de fin doit être après/);
  assert.match(view.text(), /Créer/);
});

test('switching to recurrence hides the stale end date and submits a single-day event', async () => {
  const created = [];
  view = mount(React.createElement(CreateEventModal, {
    isOpen: true,
    initialValues,
    onCancel() {},
    onCreate: (value) => created.push(value),
  }));

  const select = view.hostElements((props, _text, tag) => tag === 'select' && props.id === 'event-recurrence')[0];
  await view.act(() => {
    wrapper().props.onChangeCapture({ target: { id: 'event-recurrence', value: 'weekly' } });
    select.props.onChange({ target: { value: 'weekly' } });
  });
  assert.match(view.html, /data-recurring="true"/);

  const event = await submit({
    'event-date': '16-09-2026',
    'event-end-date': '17-09-2026',
    'event-start-time': '09:00',
    'event-end-time': '10:00',
    'event-recurrence': 'weekly',
  });

  assert.equal(event.stopped, false);
  assert.equal(created.length, 1);
  assert.equal(created[0].endDate, created[0].date);
  assert.equal(created[0].recurrence.frequency, 'weekly');
});

test('invalid edit chronology does not close the shared edit form or invoke onSave', async () => {
  const saved = [];
  view = mount(React.createElement(EventDetailsModal, {
    isOpen: true,
    event: { id: 1, title: 'Conseil', date: '16-09-2026', startTime: '09:00', endTime: '10:00', canEdit: true },
    canEdit: true,
    onClose() {},
    onSave: (value) => saved.push(value),
  }));

  await view.click('Modifier');
  assert.match(view.text(), /Modifier l’événement/);

  const event = await submit({
    'event-date': '16-09-2026',
    'event-end-date': '16-09-2026',
    'event-start-time': '10:00',
    'event-end-time': '09:00',
    'event-recurrence': 'none',
  });

  assert.equal(event.stopped, true);
  assert.deepEqual(saved, []);
  assert.match(view.text(), /Modifier l’événement/);
  assert.match(view.text(), /L’heure de fin doit être après/);
});

test('pending and refused edits retain submitted values, expose in-dialog feedback and retry the confirmed draft', async () => {
  const saved = [];
  let finish;
  function Harness() {
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [open, setOpen] = React.useState(true);
    return React.createElement(EventDetailsModal, {
      isOpen: open, canEdit: true, saving, error,
      people: [{ id: 1, name: 'Agent test' }],
      event: { id: 1, title: 'Conseil', description: 'Description officielle', date: '2026-09-16', endDate: '2026-09-16',
        category: 'meeting', service: 'direction', startTime: '09:00', endTime: '10:00', location: 'Mairie',
        assigneeIds: [1], recurrence: { frequency: 'weekly', interval: 2, daysOfWeek: [3], endsOn: '2026-10-31' } },
      onClose() { setOpen(false); },
      async onSave(value) {
        saved.push(value);
        setSaving(true); setError(null);
        const accepted = await new Promise(resolve => { finish = resolve; });
        setSaving(false);
        if (accepted) setOpen(false);
        else setError('Refus temporaire, réessayez.');
        return accepted;
      },
    });
  }
  view = mount(React.createElement(Harness));
  await view.click('Modifier');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Titre conservé' } });
  await view.fire(props => props.id === 'event-description', 'onChange', { target: { value: 'Description conservée' } });
  await view.fire(props => props.id === 'event-location', 'onChange', { target: { value: 'Salle conservée' } });
  const fields = { 'event-date': '16-09-2026', 'event-end-date': '16-09-2026', 'event-start-time': '09:00',
    'event-end-time': '10:00', 'event-recurrence': 'weekly', 'event-recurrence-end': '31-10-2026' };
  await submit(fields);
  assert.equal(saved.length, 1);
  assert.match(view.html, /<fieldset[^>]*disabled=""[^>]*aria-busy="true"/);
  assert.match(view.html, /role="status"/);
  assert.match(view.text(), /Modifier l’événement.*Enregistrement en cours/);
  assert.match(view.html, /value="Titre conservé"/);
  await view.act(() => finish(false));
  await view.waitFor(html => html.includes('Refus temporaire'));
  assert.match(view.html, /role="alert"/);
  for (const [id, expected] of [['event-title', 'Titre conservé'], ['event-location', 'Salle conservée'],
    ['event-date', '16-09-2026'], ['event-start-time', '09:00'], ['event-end-time', '10:00']]) {
    assert.equal(view.hostElements(props => props.id === id)[0].props.value, expected);
  }
  assert.match(view.html, /Description conservée/);
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Titre confirmé' } });
  await submit(fields);
  assert.equal(saved.length, 2);
  assert.equal(saved[1].title, 'Titre confirmé');
  for (const key of ['description', 'date', 'endDate', 'category', 'service', 'startTime', 'endTime', 'location', 'assigneeIds', 'recurrence']) {
    assert.deepEqual(saved[1][key], saved[0][key], key);
  }
  await view.act(() => finish(true));
  await view.waitFor(html => !html.includes('role="dialog"'));
});

test('cancel after refused edit discards draft and reopening uses official values without another write', async () => {
  const saved = [];
  view = mount(React.createElement(EventDetailsModal, {
    isOpen: true, event: { id: 1, title: 'Conseil officiel', date: '2026-09-16', startTime: '09:00', endTime: '10:00' },
    canEdit: true, onClose() {}, onSave(value) { saved.push(value); return false; },
  }));
  await view.click('Modifier');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Brouillon abandonné' } });
  await submit({ 'event-date': '16-09-2026', 'event-end-date': '16-09-2026', 'event-start-time': '09:00', 'event-end-time': '10:00', 'event-recurrence': 'none' });
  assert.match(view.html, /value="Brouillon abandonné"/);
  await view.click('Annuler');
  assert.match(view.text(), /Détail de l’événement.*Conseil officiel/);
  await view.click('Modifier');
  assert.match(view.html, /value="Conseil officiel"/);
  assert.doesNotMatch(view.html, /Brouillon abandonné/);
  assert.equal(saved.length, 1);
});

for (const initiallyLoaded of [false, true]) {
  test(`category reads preserve the create draft when options ${initiallyLoaded ? 'are reordered' : 'first arrive'}`, async () => {
    let receiveCategories;
    const created = [];
    const opening = { ...initialValues, category: initiallyLoaded ? 'other' : undefined };
    function Harness() {
      const [categories, setCategories] = React.useState(initiallyLoaded
        ? [{ label: 'Autre', value: 'other' }, { label: 'Réunion', value: 'meeting' }] : []);
      receiveCategories = setCategories;
      return React.createElement(CreateEventModal, {
        isOpen: true, initialValues: opening, categories,
        onCancel() {}, onCreate: value => created.push(value),
      });
    }
    view = mount(React.createElement(Harness));
    for (const [id, value] of [['event-title', 'Brouillon à conserver'], ['event-description', 'Description conservée'], ['event-location', 'Lieu conservé']]) {
      await view.fire(props => props.id === id, 'onChange', { target: { value } });
    }
    await view.fire(props => props.id === 'event-start-time', 'onChange', { target: { value: '11:15' } });
    await view.fire(props => props.id === 'event-end-time', 'onChange', { target: { value: '12:45' } });
    await view.fire(props => props.id === 'event-recurrence', 'onChange', { target: { value: 'weekly' } });
    await view.act(() => receiveCategories([{ label: 'Réunion reçue', value: 'meeting' }, { label: 'Autre reçue', value: 'other' }]));
    for (const [id, value] of [['event-title', 'Brouillon à conserver'], ['event-description', 'Description conservée'], ['event-location', 'Lieu conservé']]) {
      assert.equal(view.hostElements(props => props.id === id)[0].props.value, value, id);
    }
    assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, initiallyLoaded ? 'other' : '');
    assert.match(view.text(), /Réunion reçue/);
    assert.match(view.text(), /Autre reçue/);
    assert.equal(view.hostElements(props => props.id === 'event-start-time')[0].props.value, '11:15');
    assert.equal(view.hostElements(props => props.id === 'event-end-time')[0].props.value, '12:45');
    assert.equal(view.hostElements(props => props.id === 'event-recurrence')[0].props.value, 'weekly');
    await view.fire(props => props.id === 'event-category', 'onChange', { target: { value: 'meeting' } });
    await submit({ 'event-date': '16-09-2026', 'event-end-date': '17-09-2026', 'event-start-time': '11:15', 'event-end-time': '12:45', 'event-recurrence': 'weekly' });
    assert.equal(created.length, 1);
    assert.equal(created[0].category, 'meeting');
    assert.equal(created[0].title, 'Brouillon à conserver');
    assert.equal(created[0].description, 'Description conservée');
    assert.equal(created[0].location, 'Lieu conservé');
    assert.equal(created[0].startTime, '11:15');
    assert.equal(created[0].endTime, '12:45');
    assert.equal(created[0].recurrence.frequency, 'weekly');
    assert.equal(created[0].endDate, created[0].date);
  });
}

test('category arrival preserves an in-progress details edit and its explicit original category', async () => {
  let receiveCategories;
  const event = { id: 7, title: 'Titre officiel', category: 'other', date: '2026-09-16', startTime: '09:00', endTime: '10:00' };
  function Harness() {
    const [categories, setCategories] = React.useState([]);
    receiveCategories = setCategories;
    return React.createElement(EventDetailsModal, {
      isOpen: true, canEdit: true, categories,
      event,
      onClose() {}, onSave() { return false; },
    });
  }
  view = mount(React.createElement(Harness));
  await view.click('Modifier');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Modification conservée' } });
  await view.act(() => receiveCategories([{ label: 'Réunion', value: 'meeting' }, { label: 'Autre', value: 'other' }]));
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, 'Modification conservée');
  assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, 'other');
});

test('cancel and reopen initialize a fresh creation with the newly loaded default and opening date', async () => {
  let reopen;
  let opening = initialValues;
  const created = [];
  function Harness() {
    const [open, setOpen] = React.useState(true);
    const [categories, setCategories] = React.useState([{ label: 'Réunion', value: 'meeting' }]);
    reopen = () => {
      opening = { date: '2026-09-19', startTime: '11:00', endTime: '12:00' };
      setCategories([{ label: 'Autre', value: 'other' }]);
      setOpen(true);
    };
    return React.createElement(CreateEventModal, {
      isOpen: open, initialValues: opening, categories,
      onCancel() { setOpen(false); }, onCreate: value => created.push(value),
    });
  }
  view = mount(React.createElement(Harness));
  assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, 'meeting');
  await view.fire(props => props.id === 'event-title', 'onChange', { target: { value: 'Brouillon annulé' } });
  await view.click('Annuler');
  assert.doesNotMatch(view.html, /role="dialog"/);
  await view.act(reopen);
  assert.equal(view.hostElements(props => props.id === 'event-title')[0].props.value, '');
  assert.equal(view.hostElements(props => props.id === 'event-date')[0].props.value, '19-09-2026');
  assert.equal(view.hostElements(props => props.id === 'event-start-time')[0].props.value, '11:00');
  assert.equal(view.hostElements(props => props.id === 'event-category')[0].props.value, 'other');
  assert.deepEqual(created, []);
});
