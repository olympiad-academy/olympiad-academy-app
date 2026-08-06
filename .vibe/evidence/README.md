# .vibe/evidence — verification and design evidence

Evidence artifacts per work item live under `.vibe/evidence/<work-id>/`.
Design snapshots live under `.vibe/evidence/<work-id>/design/`.

Note: `.vibe/evidence/**` is gitignored — evidence is local to the machine.
Rebuild design snapshots from their documented source (see each README's
Provenance section) when working from a fresh clone.

## Design snapshot request (standard order)

To capture design data for a new task, give the Figma-capable agent
(Claude Code + Figma MCP) this exact order — replace the placeholders:

> Снимни дизайн-снапшот для задачи `<OLY-NN>` в
> `.vibe/evidence/<oly-nn>/design/` по образцу
> `.vibe/evidence/oly-19/design/README.md`:
>
> 1. Извлеки из дизайн-источника ДАННЫЕ, не картинки: токены (theme),
>    тексты всех локалей (i18n), референс-реализацию экранов, относящихся
>    к задаче (диапазоны строк укажи в README).
> 2. Напиши README: источник + дата, таблица «файл → что это → кто
>    потребляет», provenance (byte-exact copy или transcription + как
>    проверено), живой URL прототипа если есть.
> 3. Обязательные секции README: «What this snapshot is NOT a source of»
>    (валидация — только из contracts; поля, которых нет в контракте —
>    флаг тимлиду) и «Freezing» (снапшот заморожен, обновление = новая
>    поправка, не правка на месте).
> 4. Ничего не решай: расхождения прототипа с контрактом фиксируй как
>    флаги в README, решения принимает оператор в decision register.

The snapshot is evidence, not a decision carrier: any design fact that
changes scope (new component, new mode, new screen) must be locked as a
decision in `.vibe/work/<work-id>/decision-register.md` by the operator
before build consumes it (as D12 and D11-A1 were for OLY-19).
